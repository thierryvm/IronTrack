/**
 * IronTrack v2 — Next.js 16 (App Router + React 19 + Turbopack)
 */
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Next 16 : typedRoutes n'est plus dans experimental
  typedRoutes: true,

  // Turbopack root explicite — évite le warning multi-lockfile
  // (l'ancien projet root a encore un package-lock.json)
  turbopack: {
    root: __dirname,
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/ssr',
      '@supabase/supabase-js',
    ],
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1080, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Note : /_next/static est déjà caché 1 an par Next en prod — pas besoin d'override
    ];
  },
};

export default nextConfig;
