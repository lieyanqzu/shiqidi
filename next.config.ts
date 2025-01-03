import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_ICP_NUMBER: process.env.ICP_NUMBER,
  },
};

export default nextConfig;
