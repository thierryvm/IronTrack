/**
 * 🛡️ SERVICE WORKER MINIMAL POST-ULTRAHARDCORE
 * 
 * Version sécurisée qui ÉVITE tous les conflits détectés :
 * - PAS de Google Fonts
 * - PAS de ressources Next.js dev 
 * - PAS de cache agressif
 * - Focalisé sur offline basique + cache API
 */

const CACHE_VERSION = 'irontrack-v2.1.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Listes blanches strictes - RIEN d'autre
const ALLOWED_STATIC_EXTENSIONS = ['.css', '.js', '.png', '.svg', '.ico', '.webp', '.jpg', '.jpeg'];
const SUPABASE_DOMAIN = 'taspdceblvmpvdjixyit.supabase.co';

// CRITIQUE: Vérifications anti-conflit
const isGoogleFonts = (url) => {
  return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
};

const isNextDevResource = (url) => {
  return url.includes('_next/static') || 
         url.includes('webpack') ||
         url.includes('hot-update') ||
         url.includes('__nextjs') ||
         url.includes('app/layout.css') ||
         url.includes('main-app.js') ||
         url.includes('chunks/');
};

const isDevelopment = () => {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
};

// 🔧 INSTALLATION
self.addEventListener('install', (event) => {
  console.log('SW Minimal: Installation démarrée');
  
  event.waitUntil(
    Promise.all([
      // NETTOYER d'abord les anciens caches conflictuels
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => 
          name.includes('irontrack-v1') || 
          name.includes('irontrack-static') ||
          name.includes('irontrack-dynamic') ||
          name.startsWith('workbox-') ||
          name.includes('sw-cache')
        );
        
        return Promise.all(
          oldCaches.map(cacheName => {
            console.log('🧹 SW Minimal: Suppression ancien cache conflictuel:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      
      // Cache minimal essentiel
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll([
          '/',
          '/offline.html',
          '/icon-192.png',
          '/manifest.json'
        ]).catch(error => {
          console.warn('SW: Erreur cache initial (non-bloquante):', error);
          return Promise.resolve(); // Continue malgré erreur
        });
      })
    ]).then(() => {
      console.log('✅ SW Minimal: Installation réussie et conflits résolus');
      if (!isDevelopment()) {
        self.skipWaiting(); // Seulement en production
      }
    }).catch(error => {
      console.warn('SW: Erreur installation (non-fatale):', error);
    })
  );
});

// 🎯 ACTIVATION
self.addEventListener('activate', (event) => {
  console.log('SW Minimal: Activation');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('irontrack-') && !cacheName.includes(CACHE_VERSION))
            .map(cacheName => {
              console.log('🧹 Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Prendre contrôle (seulement en production)
      !isDevelopment() ? self.clients.claim() : Promise.resolve()
      
    ]).then(() => {
      console.log('✅ SW Minimal: Activation réussie');
    }).catch(error => {
      console.warn('SW: Erreur activation (non-fatale):', error);
    })
  );
});

// 📥 GESTION REQUÊTES - Stratégie ultra-sécurisée
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // EN DÉVELOPPEMENT : NE RIEN INTERCEPTER DU TOUT
  if (isDevelopment()) {
    console.log('🔧 SW: Mode dev - laissé passer sans interception:', event.request.url);
    return; // Laisser TOUT passer en développement
  }
  
  // BLOQUEURS ABSOLUS - Empêcher conflits ULTRAHARDCORE (Production seulement)
  if (isGoogleFonts(event.request.url)) {
    // Google Fonts bloqué silencieusement
    return; // Laisser passer sans cache
  }
  
  if (isNextDevResource(event.request.url)) {
    // Mode dev - ignorer silencieusement
    return; // Laisser passer sans cache
  }
  
  // PRODUCTION - Stratégies de cache
  if (event.request.method !== 'GET') {
    return; // Ignore non-GET
  }
  
  // 1. API Supabase - NetworkFirst
  if (url.hostname.includes(SUPABASE_DOMAIN)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // 2. Assets statiques - CacheFirst
  if (ALLOWED_STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(handleStaticAsset(event.request));
    return;
  }
  
  // 3. Pages navigation - NetworkFirst avec fallback offline
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request));
    return;
  }
  
  // 4. Images dynamiques - StaleWhileRevalidate
  if (event.request.destination === 'image') {
    event.respondWith(handleDynamicImage(event.request));
    return;
  }
});

// 🔧 HANDLERS SPÉCIALISÉS

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // NetworkFirst - essayer réseau d'abord
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Sauvegarder en cache (5 minutes max)
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('SW: Réseau API échoué, tentative cache');
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback pour les erreurs critiques
    throw error;
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // SÉCURITÉ: Vérifier schéma HTTP avant cache.put
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) {
    // Extension Chrome - ignorer silencieusement
    return fetch(request); // Passer au navigateur sans cache
  }
  
  // CacheFirst - cache en priorité
  let cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Protection supplémentaire avant put()
      try {
        cache.put(request, networkResponse.clone());
      } catch (putError) {
        console.warn('SW: Impossible de mettre en cache:', request.url, putError.message);
      }
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('SW: Asset non trouvé:', request.url);
    throw error;
  }
}

async function handleNavigation(request) {
  try {
    // NetworkFirst pour les pages
    const networkResponse = await fetch(request);
    return networkResponse;
    
  } catch (error) {
    console.log('SW: Navigation offline, affichage page offline');
    
    // Fallback vers page offline
    const cache = await caches.open(STATIC_CACHE);
    const offlineResponse = await cache.match('/offline.html');
    
    return offlineResponse || new Response('Offline - Pas de connexion', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function handleDynamicImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // StaleWhileRevalidate - retourner cache + mettre à jour en arrière-plan
  const cachedResponse = await cache.match(request);
  
  const networkFetch = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    console.log('SW: Mise à jour image échouée (non-critique)');
  });
  
  // Retourner cache si disponible, sinon attendre réseau
  return cachedResponse || networkFetch;
}

// 📊 NETTOYAGE AUTOMATIQUE DES CACHES
setInterval(async () => {
  try {
    const apiCache = await caches.open(API_CACHE);
    const imageCache = await caches.open(IMAGE_CACHE);
    
    // Nettoyer les caches API anciens (> 1 heure)
    const apiKeys = await apiCache.keys();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const request of apiKeys) {
      const response = await apiCache.match(request);
      const date = new Date(response.headers.get('date')).getTime();
      
      if (date < oneHourAgo) {
        await apiCache.delete(request);
      }
    }
    
    console.log('🧹 SW: Nettoyage cache automatique effectué');
    
  } catch (error) {
    console.warn('SW: Erreur nettoyage (non-critique):', error);
  }
}, 30 * 60 * 1000); // Toutes les 30 minutes

// SW Minimal chargé silencieusement