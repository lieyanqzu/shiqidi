import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_ICP_NUMBER: process.env.ICP_NUMBER,
  },
  eslint: {
    ignoreDuringBuilds: process.env.APP_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: process.env.APP_ENV === 'development',
  },
};

export default nextConfig;
