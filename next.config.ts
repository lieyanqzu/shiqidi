import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_ICP_NUMBER: process.env.ICP_NUMBER,
    NEXT_PUBLIC_LEANCLOUD_APP_ID: process.env.LEANCLOUD_APP_ID,
    NEXT_PUBLIC_LEANCLOUD_APP_KEY: process.env.LEANCLOUD_APP_KEY,
    NEXT_PUBLIC_LEANCLOUD_SERVER_URL: process.env.LEANCLOUD_SERVER_URL,
  },
};

export default nextConfig;
