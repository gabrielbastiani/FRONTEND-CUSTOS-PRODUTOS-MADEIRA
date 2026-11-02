import type { NextConfig } from 'next';

const configuredFilesUrl =
  process.env.NEXT_PUBLIC_FILES_URL || process.env.NEXT_PUBLIC_API_URL;

if (!configuredFilesUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXT_PUBLIC_API_URL não está configurada. Defina as URLs da API antes de executar next build.'
  );
}

const backendBaseUrl = configuredFilesUrl || 'http://localhost:3333';

let backendImagePattern: {
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
};

try {
  const backendUrl = new URL(backendBaseUrl);
  backendImagePattern = {
    protocol: backendUrl.protocol === 'https:' ? 'https' : 'http',
    hostname: backendUrl.hostname,
    port: backendUrl.port,
    pathname: '/uploads/**',
  };
} catch {
  throw new Error(`NEXT_PUBLIC_FILES_URL/NEXT_PUBLIC_API_URL inválida: ${backendBaseUrl}`);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [backendImagePattern],
  },
};

export default nextConfig;
