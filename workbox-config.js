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
      // APIs Supabase UNIQUEMENT
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  ],
}; 