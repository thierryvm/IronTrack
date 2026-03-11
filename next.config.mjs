// Configuration Next.js optimisée - Sprint 2
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
  
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Fix warning Next.js 16: déclarer la qualité utilisée
    qualities: [60, 70, 75, 80, 85, 90, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 40, 48, 64, 96, 128, 256, 384],
  },

  // Configuration webpack minimale
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Can't resolve 'next.config.compiled.js'/,
      /Module not found/,
    ];

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
