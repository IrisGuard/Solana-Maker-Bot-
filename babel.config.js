module.exports = { 
  presets: ["babel-preset-expo"],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "@ledgerhq/devices/hid-framing": false,
          "@ledgerhq/devices": false,
          "@ledgerhq/hw-transport-webhid": false,
          "@ledgerhq/hw-transport": false,
          "@ledgerhq": false,
          "keystonehq": false,
          "react-qr-reader": false,
          "u2f-api": false,
          "react-native-hid": false,
          "react-native-usb": false,
          "react-native-webview": false,
          "react-native-ble-plx": false,
          "@ledgerhq/hw-transport-node-hid": false,
          
          // Use our local shims
          "@expo/next-adapter/babel": "./lib/expo-next-adapter-shim.js",
          
          // Redirect Solana wallet adapter imports to our mock implementation
          "@solana/wallet-adapter-base": "./lib/solana-adapters.js",
          "@solana/wallet-adapter-phantom": "./lib/solana-adapters.js",
          "@solana/wallet-adapter-react": "./lib/solana-adapters.js",
          "@solana/wallet-adapter-wallets": "./lib/solana-adapters.js"
        }
      }
    ]
  ]
}; 