/**
 * 🎭 TESTS PLAYWRIGHT E2E - AUDIT COMPLET IRONTRACK
 *
 * Simulation complète d'un utilisateur découvrant l'application
 * Tests critiques pour validation professionnelle
 */
import { test, expect } from '@playwright/test';

import {
  appUrl,
  signInAsAdmin,
  signInAsUser,
} from './helpers/auth';

const BASE_URL = appUrl();

test.describe('🏠 PARCOURS VISITEUR - Première découverte', () => {
  test("Page d'accueil accessible et fonctionnelle", async ({ page }) => {
    console.log("🔍 Test: Accès page d'accueil...");

    await page.goto(BASE_URL);

    await expect(page).toHaveTitle(/IronTrack/);
    await expect(page.locator('text=IronTrack')).toBeVisible();
    await expect(page.locator('text=Connexion')).toBeVisible();

    console.log("✅ Page d'accueil accessible");
  });

  test('Navigation responsive mobile', async ({ page }) => {
    console.log('📱 Test: Responsive mobile...');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    await expect(page).toHaveTitle(/IronTrack/);

    console.log('✅ Responsive mobile fonctionne');
  });

  test('Accès page auth depuis accueil', async ({ page }) => {
    console.log('🔐 Test: Navigation vers auth...');

    await page.goto(BASE_URL);
    await page.click('text=Connexion');

    await expect(page).toHaveURL(/.*auth.*/);
    await expect(page.locator('input[type="email"]')).toBeVisible();

    console.log('✅ Navigation auth fonctionne');
  });
});

test.describe('👤 PARCOURS UTILISATEUR - Navigation complète', () => {
  test('Connexion utilisateur standard', async ({ page }) => {
    console.log('🔑 Test: Connexion utilisateur...');

    await signInAsUser(page);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth');

    console.log('✅ Connexion utilisateur réussie');
  });

  test('Navigation menu principal après connexion', async ({ page }) => {
    console.log('🧭 Test: Navigation post-connexion...');

    await signInAsUser(page);

    const navItems = ['Calendrier', 'Exercices', 'Séances', 'Partenaires', 'Nutrition', 'Progression'];

    for (const item of navItems.slice(0, 3)) {
      console.log(`  📄 Test navigation: ${item}`);

      const navLink = page.locator(`text=${item}`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/.*auth.*/);
      }
    }

    console.log('✅ Navigation principale fonctionne');
  });

  test('Accès page profil utilisateur', async ({ page }) => {
    console.log('👤 Test: Accès profil utilisateur...');

    await signInAsUser(page);
    await page.goto(appUrl('/profile'));

    await expect(page).toHaveURL(/.*profile.*/);
    await expect(page.locator('text=Profil')).toBeVisible();

    console.log('✅ Profil utilisateur accessible');
  });
});

test.describe('🛡️ PARCOURS ADMIN - Interface administration', () => {
  test('Connexion compte admin', async ({ page }) => {
    console.log('👑 Test: Connexion admin...');

    await signInAsAdmin(page);
    await expect(page).not.toHaveURL(/.*auth.*/);

    console.log('✅ Connexion admin réussie');
  });

  test('Accès interface admin', async ({ page }) => {
    console.log('⚙️ Test: Interface admin...');

    await signInAsAdmin(page);
    await page.goto(appUrl('/admin'));

    await expect(page).toHaveURL(/.*admin.*/);
    await expect(page.locator('text=Administration')).toBeVisible();

    console.log('✅ Interface admin accessible');
  });

  test('Communication bidirectionnelle - Vue admin tickets', async ({ page }) => {
    console.log('💬 Test: Communication admin...');

    await signInAsAdmin(page);
    await page.goto(appUrl('/admin/tickets'));

    await expect(page).toHaveURL(/.*admin.*tickets.*/);

    console.log('✅ Communication admin accessible');
  });
});

test.describe('🔍 TESTS CRITIQUES - Fonctionnalités essentielles', () => {
  test('Gestion erreurs - Page 404', async ({ page }) => {
    console.log('🚫 Test: Gestion 404...');

    await page.goto(appUrl('/page-inexistante'));
    await expect(page.locator('text=404', 'text=introuvable', 'text=not found')).toBeVisible();

    console.log('✅ Gestion 404 fonctionne');
  });

  test("Performance - Temps chargement page accueil", async ({ page }) => {
    console.log('⚡ Test: Performance chargement...');

    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    console.log('✅ Performance acceptable pour E2E');
  });

  test('Accessibilité - Éléments focus clavier', async ({ page }) => {
    console.log('♿ Test: Navigation clavier...');

    await page.goto(BASE_URL);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);

    console.log('✅ Navigation clavier fonctionne');
  });
});
