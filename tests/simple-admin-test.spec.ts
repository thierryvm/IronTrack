import { test, expect } from '@playwright/test';

test('Test simple page admin ticket', async ({ page }) => {
  console.log('🎯 Début test simple...');
  
  // Naviguer directement vers la page admin avec un ticket existant
  const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
  
  console.log('🔗 Navigation vers:', `http://localhost:3000/admin/tickets/${ticketId}`);
  await page.goto(`http://localhost:3000/admin/tickets/${ticketId}`, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Attendre 5 secondes pour voir le comportement
  console.log('⏳ Attente 5 secondes...');
  await page.waitForTimeout(5000);
  
  // Vérifier le titre de la page
  const title = await page.title();
  console.log('📄 Titre de la page:', title);
  
  // Prendre une capture d'écran
  await page.screenshot({ path: 'test-result.png', fullPage: true });
  console.log('📸 Capture d\'écran sauvée: test-result.png');
  
  // Vérifier qu'il n'y a pas d'erreur critique
  const bodyText = await page.textContent('body');
  console.log('📝 Contenu page (100 premiers caractères):', bodyText?.substring(0, 100));
  
  // Test basique: la page doit contenir du contenu
  expect(bodyText).toBeTruthy();
  expect(bodyText?.length || 0).toBeGreaterThan(100);
  
  console.log('✅ Test simple terminé');
});