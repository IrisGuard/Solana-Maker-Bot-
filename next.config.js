/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    transpilePackages: [
      'react-native-web',
      '@react-native-async-storage/async-storage'
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    return config;
  },
  images: {
    domains: ['raw.githubusercontent.com', 'www.arweave.net'],
  }
};

module.exports = nextConfig;