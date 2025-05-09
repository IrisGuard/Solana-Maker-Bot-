/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: ['raw.githubusercontent.com', 'www.arweave.net'],
  }
};

module.exports = nextConfig;