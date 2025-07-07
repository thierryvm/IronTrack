module.exports = {
  globDirectory: '.',
  globPatterns: [
    '**/*.{js,css,html,png,svg,ico,json,mp3}'
  ],
  swDest: 'public/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2?|ttf|eot)$/,
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
      urlPattern: /^https?.*/, // cache tout ce qui est http(s)
      handler: 'NetworkFirst',
      options: {
        cacheName: 'http-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semaine
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