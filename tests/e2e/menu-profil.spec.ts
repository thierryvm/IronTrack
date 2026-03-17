// Test menu profil GitHub-style
import { test, expect } from '@playwright/test';

test.describe('Menu Profil GitHub Style', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Se connecter avec votre compte admin
    await page.getByRole('link', { name: 'Connexion' }).click();
    await page.waitForURL('**/auth');
    
    await page.fill('input[type="email"]', 'thierryvm@hotmail.com');
    await page.fill('input[type="password"]', 'Lucas24052405@');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('Menu profil desktop fonctionne', async ({ page }) => {
    // Configuration desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Chercher l'avatar/bouton profil
    const profileButton = page.locator('[data-profile-dropdown] button').first();
    await expect(profileButton).toBeVisible();
    
    // Cliquer sur l'avatar
    await profileButton.click();
    
    // Vérifier que le dropdown s'ouvre
    const dropdown = page.locator('[data-profile-dropdown] .absolute');
    await expect(dropdown).toBeVisible();
    
    // Vérifier les liens du menu
    await expect(dropdown.getByRole('link', { name: 'Profil' })).toBeVisible();
    await expect(dropdown.getByRole('link', { name: 'Paramètres' })).toBeVisible();
    await expect(dropdown.getByRole('link', { name: 'Support' })).toBeVisible();
    
    // Vérifier bouton déconnexion
    await expect(dropdown.getByRole('button', { name: /déconnecter/i })).toBeVisible();
    
    console.log('✅ Menu profil desktop fonctionne');
  });

  test('Menu profil mobile fonctionne', async ({ page }) => {
    // Configuration mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Chercher l'avatar mobile
    const profileButton = page.locator('[data-profile-dropdown] button').first();
    await expect(profileButton).toBeVisible();
    
    // Cliquer sur l'avatar
    await profileButton.click();
    
    // Vérifier que le modal s'ouvre (style mobile)
    const modal = page.locator('.fixed.inset-0.bg-black\\/50');
    await expect(modal).toBeVisible();
    
    // Vérifier contenu du modal
    await expect(modal.getByText('thierryvm@hotmail.com')).toBeVisible();
    await expect(modal.getByRole('link', { name: 'Profil' })).toBeVisible();
    
    console.log('✅ Menu profil mobile fonctionne');
  });

  test('Fermeture menu au clic extérieur', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const profileButton = page.locator('[data-profile-dropdown] button').first();
    await profileButton.click();
    
    const dropdown = page.locator('[data-profile-dropdown] .absolute');
    await expect(dropdown).toBeVisible();
    
    // Cliquer ailleurs pour fermer
    await page.click('body');
    
    // Vérifier que le dropdown se ferme
    await expect(dropdown).toBeHidden();
    
    console.log('✅ Fermeture au clic extérieur fonctionne');
  });
});

console.log('🔧 Tests menu profil GitHub créés');