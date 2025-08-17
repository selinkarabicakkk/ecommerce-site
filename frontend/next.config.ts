import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Hızlı deploy: build sırasında ESLint hatalarını yok say
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opsiyonel: type hataları nedeniyle build'i durdurma
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
