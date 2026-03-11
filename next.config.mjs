// Configuration Next.js simplifiÃ©e pour Ã©viter warnings webpack
const nextConfig = {
  experimental: {
    optimizeCss: true,
    cpus: 1,
    webpackBuildWorker: false,
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },
  
  // OPTIMISATION CRITIQUE - Bundle splitting (swcMinify deprecated Next.js 15)
  
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // Configuration webpack minimale pour Ã©viter l'erreur 'self is not defined'
  webpack: (config, { dev, isServer }) => {
    // Ignorer les warnings spÃ©cifiques
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Can't resolve 'next.config.compiled.js'/,
      /Module not found/,
    ];

    // Fix pour l'erreur 'self is not defined' cÃ´tÃ© serveur
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;