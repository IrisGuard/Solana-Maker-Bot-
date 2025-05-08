module.exports = {
  webpack: (config, { isServer }) => {
    // Bypass all problematic modules
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
      'react-native-hid': false,
      'react-native-usb': false,
      'react-native-webview': false,
      'react-native-ble-plx': false,
      '@react-native-async-storage/async-storage': false,
      '@ledgerhq/hw-transport-node-hid': false,
      
      // Redirect Solana wallet adapter imports to our mock implementation
      "@solana/wallet-adapter-base": './lib/solana-adapters.js',
      "@solana/wallet-adapter-phantom": './lib/solana-adapters.js',
      "@solana/wallet-adapter-react": './lib/solana-adapters.js',
      "@solana/wallet-adapter-wallets": './lib/solana-adapters.js',
      
      // React Native Web compatibility
      'react-native': 'react-native-web',
    };

    // Settings for problematic modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add a noop module rule for all problematic modules
    config.module.rules.push({
      test: /[\\/]node_modules[\\/](@ledgerhq|keystonehq|react-qr-reader|react-native-hid|react-native-usb|react-native-ble-plx)[\\/].*/,
      use: 'null-loader',
    });

    // Bypass as external
    config.externals = [
      ...(config.externals || []),
      function(context, request, callback) {
        if (request.includes('ledgerhq') || 
            request.includes('hw-transport') || 
            request.includes('keystonehq') ||
            request.includes('react-qr-reader') ||
            request.includes('react-native-hid') ||
            request.includes('react-native-usb') ||
            request.includes('react-native-ble-plx')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      }
    ];

    return config;
  },
  // Additional settings for nextjs
  reactStrictMode: false,
  experimental: {
    forceSwcTransforms: true,
  }
}