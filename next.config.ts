import type { NextConfig } from "next";
import withPWA from "next-pwa";

type PWAOptions = Parameters<typeof withPWA>[0] & {
  publicExcludes?: string[];
};

const pwaOptions: PWAOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  publicExcludes: ["!data/**/*"],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
};

const nextConfig: NextConfig = withPWA(pwaOptions)({
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_ICP_NUMBER: process.env.ICP_NUMBER,
  },
});

export default nextConfig;
