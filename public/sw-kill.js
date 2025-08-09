/**
 * 🚫 SERVICE WORKER KILLER - DÉSACTIVATION IMMÉDIATE
 * 
 * Ce SW se désactive lui-même immédiatement et ne fait RIEN d'autre
 * Remplace tous les autres SW pour résoudre les conflits critiques
 */

console.log('🚫 SW KILLER: Désactivation immédiate en cours...');

// Installation immédiate sans cache
self.addEventListener('install', (event) => {
  console.log('🚫 SW KILLER: Installation - saut immédiat vers activation');
  self.skipWaiting(); // Passer immédiatement à l'état activé
});

// Activation - prendre contrôle et NE RIEN FAIRE
self.addEventListener('activate', (event) => {
  console.log('🚫 SW KILLER: Activation - prise de contrôle puis INACTIF');
  
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('🚫 SW KILLER: Contrôle pris - SW maintenant INACTIF');
    })
  );
});

// FETCH: NE RIEN INTERCEPTER DU TOUT
self.addEventListener('fetch', (event) => {
  // NE RIEN FAIRE - laisser toutes les requêtes passer normalement
  // Pas de event.respondWith() - transparence totale
  console.log('🚫 SW KILLER: Requête laissée passer:', event.request.url);
});

console.log('🚫 SW KILLER: Chargé - mode transparent total');