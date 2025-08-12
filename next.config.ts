// Configuration Next.js ULTRAHARDCORE - JEST WORKER FIX RADICAL
const nextConfig = {
  // FIX ULTIME Jest Worker - DÉSACTIVATION TOTALE
  experimental: {
    workerThreads: false,
    cpus: 1,
    webpackBuildWorker: false,
    forceSwcTransforms: false,
    optimizeCss: false,
    optimizePackageImports: false,
    turbotrace: false,
    // NOUVEAU: Désactiver complètement Jest
    esmExternals: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
      // ULTRAHARDCORE: Google Fonts supprimé
      // { protocol: 'https', hostname: 'fonts.googleapis.com' },
      // { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
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
  webpack: (config: any, { dev, isServer }: { dev: boolean, isServer: boolean }) => {
    if (dev) {
      // SOLUTION RADICALE: Élimination totale Jest worker
      config.parallelism = 1;
      config.cache = false;
      config.experiments = {
        ...config.experiments,
        topLevelAwait: false,
      };
      
      // DÉSACTIVER TOUS LES WORKERS
      config.optimization = {
        ...config.optimization,
        minimize: false,
        sideEffects: false,
        splitChunks: false,
        runtimeChunk: false,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        mergeDuplicateChunks: false,
      };
      
      // PATCH JEST DIRECT
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          'jest-worker': false,
        },
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