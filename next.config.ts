import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // keeps things modern and fast; safe to remove if you prefer defaults
    optimizePackageImports: ["remark", "remark-html"]
  },
  images: {
    // Using local /public images. If later you add remote images, whitelist here.
    remotePatterns: []
  }
};

export default nextConfig;
