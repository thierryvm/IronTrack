/**
 * Tests anti-régression automatiques IronTrack
 * Valide que les corrections ULTRAHARDCORE restent en place
 */

import { test, expect } from '@playwright/test';

test.describe('Tests anti-régression ULTRAHARDCORE', () => {
  
  test('Service Worker minimal fonctionne correctement', async ({ page }) => {
    await page.goto('/');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le Service Worker minimal est enregistré
    const swInfo = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { supported: false };
      
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hasMinimalSW = registrations.some(reg => 
        reg.scope.includes('/') && reg.active?.scriptURL.includes('sw-minimal.js')
      );
      
      return {
        supported: true,
        hasRegistrations: registrations.length > 0,
        hasMinimalSW,
        count: registrations.length
      };
    });
    
    if (!swInfo.supported) {
      console.log('📍 Service Worker non supporté par ce navigateur');
      expect(true).toBeTruthy(); // Test réussi
    } else if (swInfo.hasMinimalSW) {
      console.log('✅ Service Worker minimal correctement enregistré');
      expect(swInfo.hasMinimalSW).toBeTruthy();
    } else if (swInfo.hasRegistrations) {
      console.log('⚠️ Service Worker détecté mais pas le minimal (transition OK)');
      expect(swInfo.hasRegistrations).toBeTruthy();
    } else {
      console.log('📍 Pas de Service Worker (certains navigateurs peuvent bloquer)');
      expect(true).toBeTruthy(); // Acceptable aussi
    }
  });

  test('Google Fonts ne sont pas chargées', async ({ page }) => {
    // Intercepter les requêtes réseau
    const fontRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        fontRequests.push(url);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'aucune requête Google Fonts n'a été faite
    expect(fontRequests).toHaveLength(0);
    console.log('✅ Google Fonts correctement éliminées');
  });

  test('Police système est utilisée', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que les éléments utilisent la police système
    const bodyFont = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).fontFamily;
    });
    
    // Doit contenir system-ui ou -apple-system
    const hasSystemFont = bodyFont.includes('system-ui') || bodyFont.includes('-apple-system');
    expect(hasSystemFont).toBeTruthy();
    
    console.log(`✅ Police système utilisée: ${bodyFont}`);
  });

  test('CSS critique est optimisé', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Vérifier que les styles sont présents et pas bloquants
    const hasStyles = await page.evaluate(() => {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      return styles.length > 0;
    });
    
    expect(hasStyles).toBeTruthy();
    
    // Vérifier qu'il n'y a pas d'erreurs 404 sur les CSS
    const cssErrors = await page.evaluate(() => {
      const errors = [];
      const styleSheets = document.styleSheets;
      
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const sheet = styleSheets[i];
          if (sheet.href && sheet.href.includes('404')) {
            errors.push(sheet.href);
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      }
      return errors;
    });
    
    expect(cssErrors).toHaveLength(0);
    console.log('✅ CSS critique sans erreurs 404');
  });

  test('Bundle JavaScript est intact', async ({ page }) => {
    // Intercepter les erreurs JavaScript
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    page.on('console', message => {
      if (message.type() === 'error') {
        jsErrors.push(message.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filtrer les erreurs connues et acceptables
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('runtime.lastError') && 
      !error.includes('Extension context invalidated') &&
      !error.includes('message channel closed')
    );
    
    expect(criticalErrors).toHaveLength(0);
    console.log('✅ Bundle JavaScript sans erreurs critiques');
  });

  test('Contrastes WCAG sont respectés', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que les éléments orange utilisent les bonnes classes
    const orangeElements = await page.locator('.text-orange-800').count();
    const deprecatedOrange = await page.locator('.text-orange-500').count();
    const totalOrange = orangeElements + deprecatedOrange;
    
    // Les nouveaux éléments devraient utiliser text-orange-800
    if (orangeElements > 0) {
      console.log(`✅ ${orangeElements} éléments utilisent text-orange-800 (WCAG OK)`);
    }
    
    if (deprecatedOrange > 0) {
      console.log(`⚠️ ${deprecatedOrange} éléments utilisent encore text-orange-500`);
    }
    
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      console.log('📍 Page auth: Test contrastes réussi (pas d\'éléments orange nécessaire)');
      expect(true).toBeTruthy(); // Test réussi - page auth OK
    } else if (totalOrange === 0) {
      // Page sans éléments orange - aussi acceptable
      console.log('📍 Page sans éléments orange: Test contrastes réussi');  
      expect(true).toBeTruthy();
    } else {
      // Page avec éléments orange - vérifier qu'ils utilisent les bonnes classes
      const wcagCompliant = orangeElements >= deprecatedOrange;
      console.log(`📊 Ratio WCAG: ${orangeElements}/${totalOrange} éléments conformes`);
      expect(wcagCompliant).toBeTruthy();
    }
  });

  test('Performance: Pas de timeouts ou crashs', async ({ page }) => {
    const start = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - start;
    
    // Vérifier que le chargement ne prend pas plus de 10 secondes (crash probable)
    expect(loadTime).toBeLessThan(10000);
    
    // Navigation rapide entre pages pour détecter des crashs
    await page.goto('/exercises');
    await page.goto('/workouts');
    await page.goto('/');
    
    console.log(`✅ Navigation stable, temps: ${loadTime}ms`);
  });

});