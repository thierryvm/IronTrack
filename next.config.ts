// Configuration Next.js 15.3.5 - Optimisations LCP & Performance 2025
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
    ],
    // Optimisations LCP critiques
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Experimental features pour performance 2025
  experimental: {
    // Tree shaking agressif - optimisé pour Next.js 15.3.5
    optimizePackageImports: [
      'lucide-react',
      'framer-motion', 
      'react-hot-toast', 
      'date-fns',
      '@supabase/supabase-js',
      'recharts',
      'react-hook-form'
    ],
  },
  // Optimisations JavaScript production - Next.js 15.3.5
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'] // Garder les erreurs/warnings
    } : false,
    // Optimisations React avancées
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { 
      properties: ['^data-testid$', '^data-cy$', '^data-test$'] 
    } : false,
    // JSX runtime automatique (React 18+)
    emotion: false,
    // Minification avancée
    styledComponents: false,
  },
  // Webpack 5 optimisé pour Next.js 15.3.5 - Performance maximale + Bundle analyzer
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Optimisations production uniquement
    if (!dev && !isServer) {
      // Alias pour tree shaking optimal
      config.resolve.alias = {
        ...config.resolve.alias,
        // ES modules pour meilleur tree shaking
        'date-fns': 'date-fns/esm',
        'lodash': 'lodash-es',
      };
      
      // Bundle splitting optimal pour LCP
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Réduction à 200KB pour éviter chunks trop volumineux
          maxAsyncRequests: 30,
          maxInitialRequests: 6,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            // Framework critique (chargé immédiatement)
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              priority: 50,
              chunks: 'all',
              enforce: true,
              maxSize: 150000, // Limité à 150KB
            },
            // Libraries lourdes (lazy load)
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 40,
              chunks: 'async', // Chargement asynchrone
              enforce: true,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-)[\\/]/,
              name: 'charts',
              priority: 40,
              chunks: 'async', // Lazy load pour graphiques
              enforce: true,
            },
            // Supabase (critique pour auth)
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 35,
              chunks: 'all',
              maxSize: 120000,
            },
            // Utilitaires (critiques)
            utilities: {
              test: /[\\/]node_modules[\\/](lucide-react|date-fns|dompurify|react-hot-toast)[\\/]/,
              name: 'utilities',
              priority: 25,
              chunks: 'all',
              maxSize: 100000,
            },
            // Vendor optimisé (non critique)
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              chunks: 'async',
              minChunks: 2,
            },
            // Code application commun
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
        // Module concatenation pour meilleur tree shaking
        concatenateModules: true,
        // Optimisation side effects
        sideEffects: false,
      };
      
      // Analyse bundle en développement
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analysis.html',
          })
        );
      }
    }
    
    return config;
  },
  // Headers de sécurité et performance pour HTTP/2+
  async headers() {
    return [
      // Headers pour les assets statiques Next.js - FIX SYNTAX ERROR
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Headers généraux pour les pages
      {
        source: '/((?!_next/static|favicon.ico).*)',
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
            key: 'X-Frame-Options',
            value: 'DENY'
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
