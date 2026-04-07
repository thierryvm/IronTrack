// Test simple de la structure navigation mobile
import { test, expect } from '@playwright/test';
import { appUrl } from './helpers/auth';

test.describe('Navigation Mobile Structure', () => {
  test('Structure navigation mobile en place', async ({ page }) => {
    // Configuration mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(appUrl());
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page se charge
    await expect(page.getByText('IronTrack')).toBeVisible();
    
    // Test structure basique - Header mobile vs desktop
    const headers = page.locator('header');
    const headerCount = await headers.count();
    console.log(`📱 Trouvé ${headerCount} headers sur la page`);
    
    // Devrait avoir 2 headers: un pour mobile, un pour desktop
    expect(headerCount).toBeGreaterThanOrEqual(1);
    
    // Vérifier qu'on a bien des classes responsive
    const mobileElements = page.locator('[class*="md:hidden"]');
    const mobileCount = await mobileElements.count();
    console.log(`📱 Trouvé ${mobileCount} éléments mobiles (md:hidden)`);
    
    const desktopElements = page.locator('[class*="hidden"][class*="md:block"]');
    const desktopCount = await desktopElements.count();
    console.log(`🖥️ Trouvé ${desktopCount} éléments desktop (hidden md:block)`);
    
    // Au moins un élément mobile et un élément desktop
    expect(mobileCount).toBeGreaterThan(0);
    expect(desktopCount).toBeGreaterThan(0);
  });

  test('Navigation desktop vs mobile responsive', async ({ page }) => {
    // Test desktop d'abord
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(appUrl());
    await page.waitForLoadState('networkidle');
    
    // Vérifier navigation desktop
    const desktopNav = page.locator('header nav').first();
    await expect(desktopNav).toBeVisible();
    
    // Maintenant mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Laisser le responsive se mettre en place
    
    // Structure doit toujours être cohérente
    await expect(page.getByText('IronTrack')).toBeVisible();
    
    console.log('✅ Test responsive desktop/mobile passé');
  });
});

console.log('📱 Test navigation structure créé');
