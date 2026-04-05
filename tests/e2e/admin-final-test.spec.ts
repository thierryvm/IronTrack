import { test, expect } from '@playwright/test';
import { getE2EBaseUrl, loginAs } from './helpers/auth';

const BASE_URL = getE2EBaseUrl();

test('Test final communication bidirectionnelle', async ({ page }) => {
  console.log('🎯 TEST FINAL - Communication bidirectionnelle');
  
  try {
    // 1. Aller à la page d'authentification correcte
    console.log('🔐 Navigation vers /auth...');
    await page.goto(`${BASE_URL}/auth`);
    await page.waitForLoadState('networkidle');
    
    // 2. Se connecter avec le compte admin
    console.log('🔑 Connexion avec compte admin...');
    await loginAs(page, 'admin');
    console.log('📤 Formulaire soumis...');
    
    // 3. Attendre la redirection
    console.log('⏳ Attente redirection après connexion...');
    await page.waitForTimeout(3000);
    
    // 4. Naviguer vers la page admin du ticket
    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    console.log('🎫 Navigation vers ticket admin:', ticketId);
    
    await page.goto(`${BASE_URL}/admin/tickets/${ticketId}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 5. Surveillance des logs console
    const importantLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('💚 [FINAL]') || text.includes('Error') || text.includes('ERREUR') || text.includes('permissions')) {
        importantLogs.push(text);
        console.log('📝 LOG:', text);
      }
    });
    
    // 6. Attendre le chargement et observer
    console.log('👀 Observation du comportement de chargement...');
    
    let pageState = 'unknown';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      await page.waitForTimeout(2000);
      const bodyText = await page.textContent('body') || '';
      
      console.log(`🔍 Tentative ${attempts}/${maxAttempts}:`);
      console.log(`   - Titre: ${await page.title()}`);
      console.log(`   - URL: ${page.url()}`);
      console.log(`   - Contenu (100 chars): ${bodyText.substring(0, 100)}...`);
      
      if (bodyText.includes('Test du système de Q&R')) {
        pageState = 'success';
        console.log('✅ SUCCESS: Page admin chargée avec succès!');
        break;
      } else if (bodyText.includes('Vérification des permissions admin')) {
        pageState = 'permission_loop';
        console.log('⚠️ DÉTECTÉ: Boucle vérification permissions');
        continue; // Continue à attendre
      } else if (bodyText.includes('Chargement')) {
        pageState = 'loading';
        console.log('⏳ État: Toujours en chargement...');
        continue;
      } else if (bodyText.includes('Erreur') || bodyText.includes('Error')) {
        pageState = 'error';
        console.log('❌ ERREUR détectée dans le contenu');
        break;
      } else if (bodyText.includes('Connexion') || bodyText.includes('login')) {
        pageState = 'auth_required';
        console.log('🔐 Retour vers page authentification');
        break;
      }
    }
    
    // 7. Prendre une capture finale
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('📸 Capture finale sauvée: final-test-result.png');
    
    // 8. Analyse et rapport final
    console.log('\n🔍 ANALYSE FINALE:');
    console.log('-------------------');
    console.log(`État final: ${pageState}`);
    console.log(`Logs importants collectés: ${importantLogs.length}`);
    console.log(`URL finale: ${page.url()}`);
    
    if (importantLogs.length > 0) {
      console.log('\n📋 LOGS CLÉS:');
      importantLogs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    // 9. Tests selon l'état
    if (pageState === 'success') {
      console.log('🎉 Test réussi - Vérification des fonctionnalités...');
      
      // Vérifier présence des contrôles admin
      const hasGestionTicket = await page.locator('text=Gestion du ticket').isVisible().catch(() => false);
      const hasRepondreTicket = await page.locator('text=Répondre au ticket').isVisible().catch(() => false);
      
      expect(hasGestionTicket).toBeTruthy();
      expect(hasRepondreTicket).toBeTruthy();
      
      console.log('✅ VALIDATION COMPLÈTE RÉUSSIE!');
      
    } else if (pageState === 'permission_loop') {
      console.log('⚠️ PROBLÈME IDENTIFIÉ: Boucle de permissions');
      throw new Error(`Page bloquée sur vérification permissions après ${attempts} tentatives`);
      
    } else if (pageState === 'auth_required') {
      console.log('🔐 PROBLÈME: Authentification échouée');
      throw new Error('Échec authentification - redirection vers login');
      
    } else {
      console.log('❌ PROBLÈME: État inattendu');
      throw new Error(`État final inattendu: ${pageState}`);
    }
    
  } catch (error) {
    console.error('💥 ERREUR DURANT LE TEST:', error instanceof Error ? error.message : String(error));
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
    throw error;
  }
});
