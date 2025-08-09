/**
 * Teardown global Playwright pour IronTrack
 * Exécuté une fois après tous les tests
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Playwright Global Teardown - IronTrack');
  
  // Nettoyer les données de test
  // await cleanupTestData();
  
  // Fermer les connexions DB si nécessaire
  // await closeConnections();
  
  console.log('✨ Nettoyage global terminé');
}

export default globalTeardown;