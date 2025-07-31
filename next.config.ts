// Configuration Next.js avec optimisations JavaScript avancées
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
    optimizePackageImports: ['lucide-react', 'framer-motion', 'react-hot-toast', 'date-fns'],
    // Tree shaking agressif pour réduire bundles
    optimizeCss: false, // Éviter les erreurs critters
  },
  // Optimisations JavaScript production
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
    // Optimisations React
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-testid$'] } : false,
    // Supprimer les imports React inutiles (React 17+)
    emotion: false,
  },
  // Configuration webpack pour optimisations avancées
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Optimisations production seulement
    if (!dev && !isServer) {
      // Tree shaking agressif pour les libraries
      config.resolve.alias = {
        ...config.resolve.alias,
        // Utiliser versions ES modules pour meilleur tree shaking
        'date-fns': 'date-fns/esm',
      };
      
      // Configuration avancée pour réduire JavaScript ancien
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 250000, // Limiter la taille des chunks à 250KB
          cacheGroups: {
            // Frameworks modernes (React, Next.js)
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              priority: 40,
              enforce: true,
            },
            // Librairies lourdes séparées
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 30,
              enforce: true,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 30,
              enforce: true,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              name: 'charts',
              priority: 30,
              enforce: true,
            },
            // Utilitaires modernes (lucide, etc.)
            utilities: {
              test: /[\\/]node_modules[\\/](lucide-react|date-fns|dompurify)[\\/]/,
              name: 'utilities',
              priority: 20,
              enforce: true,
            },
            // Vendors restants (optimisés)
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              minChunks: 1,
            },
            // Code commun de l'app
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
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
