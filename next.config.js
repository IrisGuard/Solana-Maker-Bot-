/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ledgerhq/devices/hid-framing': false,
      '@ledgerhq/devices': false,
      '@ledgerhq/hw-transport-webhid': false,
      '@ledgerhq/hw-transport': false,
      '@ledgerhq': false,
      'keystonehq': false,
      'react-qr-reader': false,
      'u2f-api': false,
    };

    // Add fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
      };
    }

    return config;
  },
  // Other configuration options
  images: {
    domains: ['raw.githubusercontent.com', 'www.arweave.net'],
  },
};

module.exports = nextConfig;