import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: "standalone" output is NOT used on Vercel — Vercel handles
  // deployment optimization automatically. We keep it off for Vercel
  // compatibility (standalone is for self-hosted Docker/Node deployments).
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
