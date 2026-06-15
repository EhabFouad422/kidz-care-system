import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@base-ui/react', 'use-sync-external-store'],
  transpilePackages: ['sonner'],
};

export default nextConfig;
