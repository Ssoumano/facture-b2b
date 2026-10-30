/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer v4 is ESM-only and must be transpiled by Next.js 14
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
