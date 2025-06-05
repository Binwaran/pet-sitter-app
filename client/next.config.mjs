/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Wildcard รองรับทุก domain
      },
    ],
  },
};

export default nextConfig;
