import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
})({
  output: 'export',
  env: {
    NEXT_PUBLIC_ICP_NUMBER: process.env.ICP_NUMBER,
    NEXT_PUBLIC_LEANCLOUD_APP_ID: process.env.LEANCLOUD_APP_ID,
    NEXT_PUBLIC_LEANCLOUD_APP_KEY: process.env.LEANCLOUD_APP_KEY,
    NEXT_PUBLIC_LEANCLOUD_SERVER_URL: process.env.LEANCLOUD_SERVER_URL,
  },
});

export default nextConfig;
