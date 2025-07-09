// Configuration Next.js standard sans next-pwa
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ton-domaine.com' },
      { protocol: 'https', hostname: 'taspdceblvmpvdjixyit.supabase.co' },
    ]
  },
};

export default nextConfig;
