/**
 * 🚫 SERVICE WORKER DÉSACTIVÉ EN MODE DÉVELOPPEMENT
 * 
 * Version qui se désactive immédiatement pour éviter TOUS les conflits
 * - Pas de cache
 * - Pas d'interceptions  
 * - Pas d'erreurs chrome-extension
 * - Mode développement = SW OFF
 */

console.log('🚫 SW DEV: Service Worker désactivé en mode développement');

// Auto-désactivation immédiate
self.addEventListener('install', (event) => {
  console.log('🚫 SW DEV: Installation - Auto-skip');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚫 SW DEV: Activation - Nettoyage et désactivation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log(`🧹 Suppression cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ SW DEV: Tous les caches supprimés');
      return self.clients.claim();
    })
  );
});

// Aucune interception = fetch normal du navigateur
self.addEventListener('fetch', (event) => {
  // Ne rien faire = laisser le navigateur gérer normalement
  return;
});

console.log('🚫 SW DEV: Service Worker en mode passif (développement)');