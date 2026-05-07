import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tristhana/shared', '@tristhana/db'],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
