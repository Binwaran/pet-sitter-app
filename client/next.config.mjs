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
  // เพิ่มส่วนนี้เพื่อแก้ปัญหา LightningCSS
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },
  transpilePackages: ["lightningcss"],
};

export default nextConfig;
