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
  transpilePackages: ["@tailwindcss/oxide"],
  experimental: {
    // Force Tailwind to use the JS implementation
    forceSwcTransforms: true,
  },
};

export default nextConfig;
