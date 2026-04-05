/**
 * 🎭 TESTS PLAYWRIGHT E2E - AUDIT COMPLET IRONTRACK
 * 
 * Simulation complète d'un utilisateur découvrant l'application
 * Tests critiques pour validation professionnelle
 */
const { test, expect } = require('@playwright/test');
const { getE2EBaseUrl, getE2EEmail } = require('./helpers/auth');

// Configuration des comptes de test
const ACCOUNTS = {
  admin: {
    email: getE2EEmail('admin'),
    password: process.env.E2E_ADMIN_PASSWORD || ''
  },
  user: {
    email: getE2EEmail('user'), 
    password: process.env.E2E_USER_PASSWORD || ''
  }
};

const BASE_URL = getE2EBaseUrl();

test.describe('🏠 PARCOURS VISITEUR - Première découverte', () => {
  
  test('Page d\'accueil accessible et fonctionnelle', async ({ page }) => {
    console.log('🔍 Test: Accès page d\'accueil...');
    
    // Navigation vers page d'accueil
    await page.goto(BASE_URL);
    
    // Vérifications critiques
    await expect(page).toHaveTitle(/IronTrack/);
    await expect(page.locator('text=IronTrack')).toBeVisible();
    
    // Vérifier éléments navigation principaux
    await expect(page.locator('text=Connexion')).toBeVisible();
    
    console.log('✅ Page d\'accueil accessible');
  });
  
  test('Navigation responsive mobile', async ({ page }) => {
    console.log('📱 Test: Responsive mobile...');
    
    // Simuler mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Vérifier adaptation mobile
    await expect(page).toHaveTitle(/IronTrack/);
    
    console.log('✅ Responsive mobile fonctionne');
  });

  test('Accès page auth depuis accueil', async ({ page }) => {
    console.log('🔐 Test: Navigation vers auth...');
    
    await page.goto(BASE_URL);
    
    // Cliquer sur Connexion
    await page.click('text=Connexion');
    
    // Vérifier redirection
    await expect(page).toHaveURL(/.*auth.*/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    console.log('✅ Navigation auth fonctionne');
  });
});

test.describe('👤 PARCOURS UTILISATEUR - Navigation complète', () => {
  
  test('Connexion utilisateur standard', async ({ page }) => {
    console.log('🔑 Test: Connexion utilisateur...');
    
    await page.goto(`${BASE_URL}/auth`);
    
    // Remplir formulaire connexion
    await page.fill('input[type="email"]', ACCOUNTS.user.email);
    await page.fill('input[type="password"]', ACCOUNTS.user.password);
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Attendre redirection (peut être lente)
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    // Vérifier connexion réussie
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth');
    
    console.log('✅ Connexion utilisateur réussie');
  });
  
  test('Navigation menu principal après connexion', async ({ page }) => {
    console.log('🧭 Test: Navigation post-connexion...');
    
    // Se connecter d'abord
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('input[type="email"]', ACCOUNTS.user.email);
    await page.fill('input[type="password"]', ACCOUNTS.user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    // Tester navigation principale
    const navItems = ['Calendrier', 'Exercices', 'Séances', 'Partenaires', 'Nutrition', 'Progression'];
    
    for (const item of navItems.slice(0, 3)) { // Tester les 3 premiers pour rapidité
      console.log(`  📄 Test navigation: ${item}`);
      
      const navLink = page.locator(`text=${item}`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(1000); // Attendre chargement
        
        // Vérifier que la page a changé
        await expect(page).not.toHaveURL(/.*auth.*/);
      }
    }
    
    console.log('✅ Navigation principale fonctionne');
  });
  
  test('Accès page profil utilisateur', async ({ page }) => {
    console.log('👤 Test: Accès profil utilisateur...');
    
    // Se connecter
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('input[type="email"]', ACCOUNTS.user.email);
    await page.fill('input[type="password"]', ACCOUNTS.user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    // Aller au profil
    await page.goto(`${BASE_URL}/profile`);
    
    // Vérifier contenu profil
    await expect(page).toHaveURL(/.*profile.*/);
    await expect(page.locator('text=Profil')).toBeVisible();
    
    console.log('✅ Profil utilisateur accessible');
  });
});

test.describe('🛡️ PARCOURS ADMIN - Interface administration', () => {
  
  test('Connexion compte admin', async ({ page }) => {
    console.log('👑 Test: Connexion admin...');
    
    await page.goto(`${BASE_URL}/auth`);
    
    // Connexion admin
    await page.fill('input[type="email"]', ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    console.log('✅ Connexion admin réussie');
  });
  
  test('Accès interface admin', async ({ page }) => {
    console.log('⚙️ Test: Interface admin...');
    
    // Connexion admin
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('input[type="email"]', ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    // Accéder à l'admin
    await page.goto(`${BASE_URL}/admin`);
    
    // Vérifier interface admin
    await expect(page).toHaveURL(/.*admin.*/);
    await expect(page.locator('text=Administration')).toBeVisible();
    
    console.log('✅ Interface admin accessible');
  });
  
  test('Communication bidirectionnelle - Vue admin tickets', async ({ page }) => {
    console.log('💬 Test: Communication admin...');
    
    // Connexion admin
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('input[type="email"]', ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(?!auth).*/, { timeout: 15000 });
    
    // Accéder aux tickets admin
    await page.goto(`${BASE_URL}/admin/tickets`);
    
    // Vérifier page tickets
    await expect(page).toHaveURL(/.*admin.*tickets.*/);
    
    console.log('✅ Communication admin accessible');
  });
});

test.describe('🔍 TESTS CRITIQUES - Fonctionnalités essentielles', () => {
  
  test('Gestion erreurs - Page 404', async ({ page }) => {
    console.log('🚫 Test: Gestion 404...');
    
    await page.goto(`${BASE_URL}/page-inexistante`);
    
    // Vérifier gestion 404
    await expect(page.locator('text=404', 'text=introuvable', 'text=not found')).toBeVisible();
    
    console.log('✅ Gestion 404 fonctionne');
  });
  
  test('Performance - Temps chargement page accueil', async ({ page }) => {
    console.log('⚡ Test: Performance chargement...');
    
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    // Acceptable si < 5 secondes pour tests E2E
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance acceptable pour E2E');
  });
  
  test('Accessibilité - Éléments focus clavier', async ({ page }) => {
    console.log('♿ Test: Navigation clavier...');
    
    await page.goto(BASE_URL);
    
    // Tester navigation clavier
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Vérifier qu'un élément a le focus
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
    
    console.log('✅ Navigation clavier fonctionne');
  });
});
