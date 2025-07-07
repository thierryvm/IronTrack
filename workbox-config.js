module.exports = {
  globDirectory: 'public',
  globPatterns: [
    '**/*.{js,css,html,png,svg,ico,json,mp3}'
  ],
  swDest: 'public/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
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
}; 