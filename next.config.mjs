// Configuration Next.js optimisée - Sprint 2
const nextConfig = {
  experimental: {
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
          // HSTS — force HTTPS 2 ans, incluant sous-domaines
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Désactive fonctionnalités non utilisées (DDoS surface reduction)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()' },
          // Protection XSS legacy browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // CSP — sources autorisées uniquement
          { key: 'Content-Security-Policy', value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com https://vercel.live",
            "img-src 'self' data: blob: https://taspdceblvmpvdjixyit.supabase.co https://iron-track-dusky.vercel.app https://vercel.com",
            "connect-src 'self' https://taspdceblvmpvdjixyit.supabase.co wss://taspdceblvmpvdjixyit.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com",
            "media-src 'self'",
            "frame-src https://vercel.live",
          "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ') },
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
  webpack: (config, { isServer, nextRuntime }) => {
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
    
    // Correction Edge Runtime pour Supabase Realtime
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'ws': false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
