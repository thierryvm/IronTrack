const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  globDirectory: '.',
  globPatterns: [
    '**/*.{js,css,html,png,svg,ico,json,mp3}'
  ],
  swDest: 'public/sw.js',
  clientsClaim: !isDevelopment, // Moins agressif en dev
  skipWaiting: !isDevelopment,  // Pas de skip en dev
  runtimeCaching: [
    {
      // Exclusion explicite des ressources de développement Next.js
      urlPattern: ({ url }) => {
        const isNextDev = url.pathname.startsWith('/_next/static/') && 
                         (url.search.includes('v=') || url.pathname.includes('webpack') || 
                          url.pathname.includes('main-app') || url.pathname.includes('hot-update'));
        return false; // Ne jamais matcher ces URLs
      },
      handler: 'NetworkOnly', // Pas de cache pour ces ressources
    },
    {
      // Assets statiques (images, fonts, etc.) - SEULEMENT en production
      urlPattern: ({ url }) => {
        if (isDevelopment) return false; // Désactiver en dev
        return /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2?|ttf|eot)$/.test(url.pathname);
      },
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      // APIs Supabase uniquement
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      // Pages de l'application UNIQUEMENT (pas les assets)
      urlPattern: ({ request, url }) => {
        if (isDevelopment) {
          // En dev : cache TRÈS sélectif - seulement vraies pages HTML
          return request.mode === 'navigate' && 
                 request.destination === 'document' &&
                 !url.pathname.startsWith('/_next/') &&
                 !url.pathname.startsWith('/api/') &&
                 !url.search.includes('v=');
        } else {
          // En production : navigation normale
          return request.mode === 'navigate' && request.destination === 'document';
        }
      },
      handler: isDevelopment ? 'NetworkOnly' : 'NetworkFirst', // Pas de cache en dev
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        },
      },
    },
  ],
  navigateFallback: '/offline.html',
  globIgnores: [],
  additionalManifestEntries: [
    { url: '/offline.html', revision: null },
  ],
}; 