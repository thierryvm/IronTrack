// Configuration Next.js optimisée pour performance et stabilité
const nextConfig = {
  // Configuration optimisée pour performances
  experimental: {
    workerThreads: false,
    cpus: 1,
    webpackBuildWorker: false,
    // DÉSACTIVATION temporaire optimizePackageImports pour debug
    // optimizePackageImports: [
    //   '@supabase/supabase-js',
    //   '@supabase/ssr',
    //   'framer-motion',
    //   'tailwindcss',
    // ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
    ],
    // Optimisations d'images pour performance
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
    dangerouslyAllowSVG: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    unoptimized: false,
  },
  // SOLUTION ULTIME: Variables d'environnement Next.js
  env: {
    // Forcer Next.js mode single-thread
    NEXT_CPU_COUNT: '1',
    DISABLE_WEBPACK_CACHE: 'true',
    // PATCH JEST WORKER
    JEST_WORKER_DISABLE: 'true',
    FORCE_COLOR: '0',
    CI: 'true', // Simule environnement CI pour désactiver optimisations
  },
  // Ignorer warnings spécifiques Supabase Edge Runtime
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuration simple optimisée pour stabilité  
  webpack: (config: any, { dev, isServer }: { dev: boolean, isServer: boolean }) => {
    // ULTRAHARDCORE: Suppression warnings Supabase Edge Runtime
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /A Node\.js API is used \(process\./,
      /which is not supported in the Edge Runtime/,
    ];
    // ULTRAHARDCORE: Configuration simplifiée pour éviter problèmes webpack
    if (isServer && !dev) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        'global': false,
      };
      
      // FIX CRITIQUE: Définir 'self' côté serveur pour éviter ReferenceError
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': JSON.stringify('undefined'),
          'self': 'undefined',
        })
      );
    }

    // Production: optimisations bundle DÉSACTIVÉES temporairement
    if (!dev) {
      // DÉSACTIVATION splitChunks qui génère vendors.js problématique
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async', // Seulement splits async, pas vendors.js
        },
      };
    }
    
    // Developement: stabilité
    if (dev) {
      config.parallelism = 1;
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  // Mode développement simplifié - swcMinify retiré (deprecated)
  // PAS de CSP restrictive
  // PAS d'optimisations webpack complexes
  // Configuration minimale pour stabilité
};

export default nextConfig;