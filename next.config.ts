import type { NextConfig } from 'next';

const configuredFilesUrl =
  process.env.NEXT_PUBLIC_FILES_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

let backendImagePattern: {
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
};

try {
  const backendUrl = new URL(configuredFilesUrl, 'http://localhost:3333');
  backendImagePattern = {
    protocol: backendUrl.protocol === 'https:' ? 'https' : 'http',
    hostname: backendUrl.hostname,
    port: backendUrl.port,
    pathname: '/uploads/**',
  };
} catch {
  backendImagePattern = {
    protocol: 'http',
    hostname: 'localhost',
    port: '3333',
    pathname: '/uploads/**',
  };
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [backendImagePattern],
  },
};

export default nextConfig;
