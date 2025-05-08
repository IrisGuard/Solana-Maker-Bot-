// Mock implementations for Solana wallet adapter modules
// This file is used for development purposes only

// @solana/wallet-adapter-base
export const BaseWalletAdapter = class BaseWalletAdapter {
  constructor() {
    this.publicKey = null;
    this.connecting = false;
  }
  
  connect() {
    console.log('Mock connect called');
    return Promise.resolve();
  }
  
  disconnect() {
    console.log('Mock disconnect called');
    return Promise.resolve();
  }
};

export const WalletAdapterNetwork = {
  Mainnet: 'mainnet-beta',
  Testnet: 'testnet',
  Devnet: 'devnet',
};

export const WalletError = class WalletError extends Error {
  constructor(message, error) {
    super(message);
    this.error = error;
  }
};

export const WalletNotConnectedError = class WalletNotConnectedError extends WalletError {
  constructor() {
    super('Wallet not connected');
  }
};

export const WalletNotReadyError = class WalletNotReadyError extends WalletError {
  constructor() {
    super('Wallet not ready');
  }
};

// @solana/wallet-adapter-phantom
export const PhantomWalletAdapter = class PhantomWalletAdapter extends BaseWalletAdapter {
  constructor() {
    super();
    this.name = 'Phantom';
    this.url = 'https://phantom.app';
    this.icon = 'https://phantom.app/img/logo.png';
    this.publicKey = { toString: () => '5KKsWtpQ9kZj7JpgAQxMsXxGJv3Hz9zTzbxXwsGGXrEMEJxpnQiiDCPCqyRxkJZNGzLSVps24jkwLNMHtpm9jNrA' };
    this.connecting = false;
  }
  
  connect() {
    console.log('Mock Phantom connect called');
    this.connecting = true;
    
    // Simulate connection delay
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connecting = false;
        resolve();
      }, 500);
    });
  }
  
  disconnect() {
    console.log('Mock Phantom disconnect called');
    return Promise.resolve();
  }
  
  signTransaction(transaction) {
    console.log('Mock Phantom signTransaction called');
    return Promise.resolve(transaction);
  }
  
  signAllTransactions(transactions) {
    console.log('Mock Phantom signAllTransactions called');
    return Promise.resolve(transactions);
  }
  
  signMessage(message) {
    console.log('Mock Phantom signMessage called');
    return Promise.resolve(new Uint8Array([0, 1, 2, 3]));
  }
};

// @solana/wallet-adapter-react
export const useWallet = () => {
  return {
    wallet: null,
    adapter: null,
    publicKey: { toString: () => '5KKsWtpQ9kZj7JpgAQxMsXxGJv3Hz9zTzbxXwsGGXrEMEJxpnQiiDCPCqyRxkJZNGzLSVps24jkwLNMHtpm9jNrA' },
    connected: false,
    connecting: false,
    disconnecting: false,
    select: () => {},
    connect: async () => {},
    disconnect: async () => {},
    sendTransaction: async () => {},
    signTransaction: async () => {},
    signAllTransactions: async () => {},
    signMessage: async () => {},
  };
};

export const WalletProvider = ({ children }) => {
  return children;
};

export const useConnection = () => {
  return {
    connection: {
      getBalance: async () => BigInt(1000000000), // 1 SOL in lamports
      getAccountInfo: async () => ({ lamports: BigInt(1000000000) }),
      getTokenAccountBalance: async () => ({ value: { amount: "1000000000", decimals: 9, uiAmount: 1.0 } }),
      getRecentBlockhash: async () => ({ blockhash: "mock-blockhash", lastValidBlockHeight: 1000 }),
      simulateTransaction: async () => ({ value: { err: null } }),
      sendTransaction: async () => "mock-transaction-signature"
    },
    endpoint: "https://api.mainnet-beta.solana.com"
  };
};

export const ConnectionProvider = ({ children }) => {
  return children;
};

// @solana/wallet-adapter-wallets
export const getPhantomWallet = () => {
  return new PhantomWalletAdapter();
};

export const getSolflareWallet = () => {
  const adapter = new BaseWalletAdapter();
  adapter.name = 'Solflare';
  adapter.url = 'https://solflare.com';
  adapter.icon = 'https://solflare.com/logo.png';
  adapter.publicKey = { toString: () => '7XSvWUMDxM3ZTxMj7nAmEmZmokhMm1XdMkaEP4QJKuHr5JX6RBQ8ZyJZ' };
  return adapter;
};

export default {
  // Base exports
  BaseWalletAdapter,
  WalletAdapterNetwork,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  
  // Phantom exports
  PhantomWalletAdapter,
  
  // React exports
  useWallet,
  WalletProvider,
  useConnection,
  ConnectionProvider,
  
  // Wallets exports
  getPhantomWallet,
  getSolflareWallet,
}; 