/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow connections from the local network
  allowedDevOrigins: ['192.168.0.101'],
  async rewrites() {
    return [
      {
        source: '/supabase-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback.supabase.co'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
