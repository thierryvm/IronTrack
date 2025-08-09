/**
 * Setup global Playwright pour IronTrack
 * Exécuté une fois avant tous les tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Playwright Global Setup - IronTrack');
  
  // Vérifier que le serveur est accessible
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log(`⏳ Vérification accessibilité ${baseURL}...`);
    await page.goto(baseURL, { timeout: 30000 });
    
    // Vérifier que la page se charge correctement
    await page.waitForSelector('header', { timeout: 10000 });
    console.log('✅ Application IronTrack accessible');
    
    // Préparer l'authentification si nécessaire
    // await setupAuthentication(page);
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Erreur setup global:', error);
    throw error;
  }
  
  console.log('🎯 Setup global terminé avec succès');
}

export default globalSetup;