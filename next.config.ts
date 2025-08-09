// Configuration Next.js ULTRAHARDCORE - Node.js v24 Compatible
const nextConfig = {
  // CORRECTION CRITIQUE: Node.js v24 compatibility + Jest Worker Fix
  experimental: {
    workerThreads: false,
    cpus: 1,
    // Désactiver toutes optimisations problématiques
    optimizeCss: false,
    // NOUVEAU: Fix Jest Worker
    webpackBuildWorker: false,
    forceSwcTransforms: false,
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
      // Configuration ultra-minimaliste
      config.parallelism = 1;
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: false,
        sideEffects: false,
        splitChunks: false,
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