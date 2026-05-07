import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tristhana/shared', '@tristhana/db'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
