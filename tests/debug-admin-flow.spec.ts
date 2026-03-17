import { test, expect } from '@playwright/test';

test('Debug flow admin détaillé', async ({ page }) => {
  console.log('🚨 DEBUG FLOW - Analyse détaillée du problème');
  
  try {
    // Collecter tous les logs console
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (text.includes('🚨 [DEBUG]') || text.includes('ERREUR') || text.includes('Error')) {
        console.log(`📝 [${msg.type()}]`, text);
      }
    });

    // Collecter les erreurs réseau
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`🌐 [NETWORK ERROR] ${response.status()} ${response.url()}`);
      }
    });
    
    // 1. Connexion
    console.log('🔐 Connexion admin...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'thierryvm@hotmail.com');
    await page.fill('input[type="password"]', 'Lucas24052405@');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    console.log('✅ Connexion effectuée');
    
    // 2. Navigation vers debug page
    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    console.log('🎫 Navigation vers page debug:', ticketId);
    
    await page.goto(`http://localhost:3000/admin/tickets/${ticketId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // 3. Attendre et observer les logs de debug pendant 15 secondes
    console.log('👀 Observation des logs debug pendant 15 secondes...');
    
    let lastStep = '';
    let stepChanges = 0;
    
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      
      // Lire l'état actuel
      const currentStep = await page.textContent('[data-testid="current-step"]').catch(() => 
        page.locator('text=État actuel:').locator('..').textContent().catch(() => 'UNKNOWN')
      );
      
      if (currentStep !== lastStep) {
        stepChanges++;
        console.log(`📊 Seconde ${i + 1}: État changé vers: ${currentStep}`);
        lastStep = currentStep || '';
      }
      
      // Vérifier si on a un succès
      const hasSuccess = await page.locator('text=🎉 ÉTAPE 6: SUCCÈS COMPLET!').isVisible().catch(() => false);
      if (hasSuccess) {
        console.log('🎉 SUCCESS détecté!');
        break;
      }
      
      // Vérifier si on a une erreur
      const hasError = await page.locator('text=💥 ERREUR GLOBALE').isVisible().catch(() => false);
      if (hasError) {
        console.log('💥 ERREUR détectée!');
        break;
      }
    }
    
    // 4. Capturer l'état final
    console.log('\n🔍 ÉTAT FINAL:');
    
    const finalBody = await page.textContent('body') || '';
    const logsCount = consoleMessages.length;
    const networkErrorsCount = networkErrors.length;
    
    console.log(`- Messages console: ${logsCount}`);
    console.log(`- Erreurs réseau: ${networkErrorsCount}`);
    console.log(`- Changements d'état: ${stepChanges}`);
    console.log(`- Contient DEBUG MODE: ${finalBody.includes('DEBUG MODE')}`);
    console.log(`- Contient SUCCÈS: ${finalBody.includes('SUCCÈS COMPLET')}`);
    console.log(`- Contient ERREUR: ${finalBody.includes('ERREUR GLOBALE')}`);
    
    // 5. Capture finale
    await page.screenshot({ path: 'debug-flow-final.png', fullPage: true });
    console.log('📸 Capture debug sauvée: debug-flow-final.png');
    
    // 6. Extraire les logs de debug spécifiques
    const debugLogs = consoleMessages.filter(msg => msg.text.includes('🚨 [DEBUG]'));
    console.log(`\n📋 LOGS DEBUG (${debugLogs.length}):`);
    
    debugLogs.slice(-20).forEach((msg, i) => {  // Derniers 20 logs
      console.log(`${i + 1}. ${msg.text}`);
    });
    
    // 7. Analyser les erreurs réseau si présentes
    if (networkErrors.length > 0) {
      console.log(`\n🌐 ERREURS RÉSEAU (${networkErrors.length}):`);
      networkErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.status} ${err.url}`);
      });
    }
    
    // Test de base : la page debug doit être chargée
    expect(finalBody).toContain('DEBUG MODE');
    
    console.log('\n✅ Debug flow terminé');
    
  } catch (error) {
    console.error('💥 ERREUR DURANT DEBUG FLOW:', error.message);
    await page.screenshot({ path: 'debug-flow-error.png', fullPage: true });
    throw error;
  }
});