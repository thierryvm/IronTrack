/**
 * 🧹 SERVICE WORKER CLEANER - NETTOYAGE COMPLET
 * 
 * Ce script se désactive lui-même et nettoie tous les autres SW
 * Usage: enregistrer temporairement, puis le supprimer
 */

console.log('🧹 SW Cleaner: Démarrage nettoyage complet...');

// 🔧 INSTALLATION - Nettoyer tous les caches
self.addEventListener('install', (event) => {
  console.log('🧹 SW Cleaner: Suppression de tous les caches...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        console.log('🧹 Caches trouvés:', cacheNames);
        
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Suppression cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('✅ SW Cleaner: Tous les caches supprimés');
        self.skipWaiting(); // Passer immédiatement à l'activation
      })
      .catch(error => {
        console.error('❌ Erreur suppression caches:', error);
      })
  );
});

// 🎯 ACTIVATION - Prendre contrôle et se désactiver
self.addEventListener('activate', (event) => {
  console.log('🧹 SW Cleaner: Activation - prise de contrôle...');
  
  event.waitUntil(
    self.clients.claim()
      .then(() => {
        console.log('✅ SW Cleaner: Contrôle pris');
        
        // Envoyer message aux clients pour se désenregistrer
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_CLEANER_READY',
            message: 'SW Cleaner prêt - désinstallez-moi maintenant'
          });
        });
        
        console.log('📢 SW Cleaner: Messages envoyés aux clients');
      })
      .catch(error => {
        console.error('❌ Erreur activation cleaner:', error);
      })
  );
});

// 📥 NE RIEN INTERCEPTER - Transparence totale
self.addEventListener('fetch', (event) => {
  // Ne rien faire - laisser toutes les requêtes passer normalement
  return;
});

console.log('🧹 SW Cleaner: Prêt pour le nettoyage');