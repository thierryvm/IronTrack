import { test, expect } from '@playwright/test';
import { appUrl, signInAsAdmin } from './helpers/auth';

test('Test page admin avec authentification', async ({ page }) => {
  console.log('🔐 Test avec authentification...');
  
  // 1. Se connecter avec le compte admin
  console.log('🔑 Connexion admin...');
  await signInAsAdmin(page);
  
  // 2. Attendre la redirection après login
  console.log('⏳ Attente redirection...');
  await page.waitForTimeout(2000);
  
  // 3. Naviguer vers la page admin du ticket
  const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
  console.log('🎫 Navigation vers ticket admin:', ticketId);
  
  await page.goto(appUrl(`/admin/tickets/${ticketId}`));
  
  // 5. Attendre et observer le comportement
  console.log('👀 Observation du chargement...');
  
  // Surveiller les messages de console
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.text().includes('💚 [FINAL]') || msg.text().includes('Error') || msg.text().includes('ERREUR')) {
      consoleMessages.push(msg.text());
      console.log('📝 Console:', msg.text());
    }
  });
  
  // Attendre le chargement (max 15 secondes)
  try {
    // Essayer d'attendre un élément qui indique que la page est chargée
    await page.waitForSelector('h1', { timeout: 15000 });
    console.log('✅ Page chargée - H1 trouvé');
  } catch (err) {
    console.log('⚠️ Timeout attente H1:', err.message);
  }
  
  // 6. Prendre une capture d'écran du résultat
  await page.screenshot({ path: 'admin-with-auth-result.png', fullPage: true });
  console.log('📸 Capture sauvée: admin-with-auth-result.png');
  
  // 7. Analyser le contenu de la page
  const bodyText = await page.textContent('body');
  const pageTitle = await page.title();
  
  console.log('📄 Titre:', pageTitle);
  console.log('📝 Messages console collectés:', consoleMessages.length);
  console.log('🔍 Contenu (200 premiers caractères):', bodyText?.substring(0, 200));
  
  // 8. Tests de validation
  if (bodyText?.includes('Test du système de Q&R')) {
    console.log('✅ SUCCESS: Page admin ticket chargée correctement!');
    
    // Vérifier la présence des éléments admin
    const hasGestionTicket = await page.locator('text=Gestion du ticket').isVisible().catch(() => false);
    const hasRepondreTicket = await page.locator('text=Répondre au ticket').isVisible().catch(() => false);
    
    console.log('🎛️ Contrôles admin présents:', hasGestionTicket);
    console.log('💬 Formulaire réponse présent:', hasRepondreTicket);
    
    expect(hasGestionTicket).toBeTruthy();
    expect(hasRepondreTicket).toBeTruthy();
    
  } else if (bodyText?.includes('Vérification des permissions')) {
    console.log('⚠️ PROBLÈME: Boucle de vérification des permissions détectée');
    throw new Error('Page bloquée sur vérification permissions - boucle infinie détectée');
    
  } else if (bodyText?.includes('Chargement')) {
    console.log('⚠️ PROBLÈME: Page bloquée sur chargement');
    throw new Error('Page bloquée sur chargement - timeout probable');
    
  } else {
    console.log('❌ ÉCHEC: Contenu inattendu de la page');
    console.log('Debug - Contenu complet:', bodyText?.substring(0, 500));
    throw new Error('Page admin ne s\'affiche pas correctement');
  }
  
  console.log('🎉 Test admin avec auth terminé avec succès!');
});
