/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // รองรับทุก domain
      },
      {
        protocol: "http",
        hostname: "**", // รองรับทุก domain (http)
      },
    ],
  },
};

export default nextConfig;
