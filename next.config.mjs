import withMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const mdx = withMDX({
  extension: /\.mdx?$/
});

const nextConfig = {
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  transpilePackages: [
    '@hanzo/ui',
    '@hanzo/auth',
    '@hanzo/commerce',
    '@luxfi/core',
    '@luxfi/data'
  ],
  productionBrowserSourceMaps: true,
};

export default {
  ...mdx,
  ...nextConfig
};