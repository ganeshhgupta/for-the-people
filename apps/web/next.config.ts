import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ftp/shared', '@ftp/db'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
