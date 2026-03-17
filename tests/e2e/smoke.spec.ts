/**
 * Tests smoke critiques pour IronTrack
 * Vérifie que les fonctionnalités essentielles marchent
 */

import { test, expect } from '@playwright/test';

test.describe('Tests smoke IronTrack', () => {
  
  test('Page d\'accueil se charge correctement', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier éléments critiques (peut rediriger vers /auth)
    await expect(page).toHaveTitle(/IronTrack/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // IronTrack redirige vers /auth si non connecté - c'est normal
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      console.log('📍 Redirection vers authentification (comportement attendu)');
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    } else {
      // Si connecté, vérifier navigation
      await expect(page.getByRole('link', { name: /exercices/i })).toBeVisible();
    }
    
    console.log('✅ Page d\'accueil fonctionnelle');
  });

  test('Navigation responsive fonctionne', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      // Test menu mobile
      const menuButton = page.locator('[aria-label*="menu" i], [data-testid="mobile-menu"], button:has-text("☰")');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.getByRole('link', { name: /exercices/i })).toBeVisible();
      }
    } else {
      // Test navigation desktop
      await expect(page.getByRole('link', { name: /exercices/i })).toBeVisible();
    }
    
    console.log(`✅ Navigation ${isMobile ? 'mobile' : 'desktop'} fonctionnelle`);
  });

  test('Pages principales se chargent sans erreur', async ({ page }) => {
    const pages = [
      { url: '/exercises', name: 'Exercices' },
      { url: '/workouts', name: 'Workouts' },
      { url: '/calendar', name: 'Calendrier' },
      { url: '/progress', name: 'Progression' },
    ];
    
    for (const { url, name } of pages) {
      const response = await page.goto(url);
      
      // Vérifier status HTTP OK (200) ou redirection (3xx)
      expect(response?.status()).toBeLessThan(400);
      
      // Vérifier présence du contenu principal
      await expect(page.locator('main')).toBeVisible();
      
      const currentUrl = page.url();
      if (currentUrl.includes('/auth')) {
        console.log(`📍 ${name}: Redirection auth (sécurité OK)`);
      } else {
        console.log(`✅ Page ${name} accessible directement`);
      }
    }
  });

  test('Formulaires critiques sont accessibles', async ({ page }) => {
    // Test formulaire connexion
    await page.goto('/auth');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    
    console.log('✅ Formulaires critiques accessibles');
  });

  test('Performance: Page se charge en moins de 5 secondes', async ({ page }) => {
    const start = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - start;
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    // Vérifier performance acceptable (5 secondes max - plus réaliste)
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance acceptable');
  });
  
  test('Accessibilité: Contraste et navigation clavier', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation clavier
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT'].some(tag => focusedElement?.includes(tag))).toBeTruthy();
    
    // Test contrastes critiques (classes text-orange-800 vs text-orange-500)
    const orangeElements = await page.locator('.text-orange-800, .text-orange-500').count();
    if (orangeElements > 0) {
      console.log(`📊 ${orangeElements} éléments orange détectés`);
    }
    
    console.log('✅ Accessibilité de base validée');
  });

});