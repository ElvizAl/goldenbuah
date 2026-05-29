import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qhytgkmhd8iyyoud.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
