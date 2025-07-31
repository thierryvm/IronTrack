// Configuration Next.js avec désactivation du linting strict pour le build Vercel
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ton-domaine.com' },
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
    ]
  },
  // Configuration pour optimiser les performances HTTP
  experimental: {
    // Activer le pre-loading des composants
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Optimisations CSS render-blocking
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Headers de sécurité et performance pour HTTP/2+
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
