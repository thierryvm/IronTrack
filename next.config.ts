// Configuration Next.js avec désactivation du linting strict pour le build Vercel
const nextConfig = {
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ton-domaine.com' },
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
    ]
  },
};

export default nextConfig;
