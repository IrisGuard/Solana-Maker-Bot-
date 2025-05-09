const { contextBridge, ipcRenderer } = require('electron');

// API για επικοινωνία με το main process
contextBridge.exposeInMainWorld('api', {
  // Bot status methods
  getBotStatus: () => ipcRenderer.invoke('get-bot-status'),
  setBotStatus: (status) => ipcRenderer.invoke('set-bot-status', status),
  setSimulationMode: (enabled) => ipcRenderer.invoke('set-simulation-mode', enabled),
  
  // Bot settings methods
  getBotSettings: () => ipcRenderer.invoke('get-bot-settings'),
  saveBotSettings: (settings) => ipcRenderer.invoke('save-bot-settings', settings),
  
  // Transaction methods
  simulateTransactions: (count) => ipcRenderer.invoke('simulate-transactions', count),
  
  // Wallet management methods
  createWallets: (count) => ipcRenderer.invoke('create-wallets', count),
  getWallets: () => ipcRenderer.invoke('get-wallets'),
  deleteWallet: (walletId) => ipcRenderer.invoke('delete-wallet', walletId),
  
  // Jupiter Aggregator methods
  getRoutes: (inputMint, outputMint, amount) => ipcRenderer.invoke('get-routes', inputMint, outputMint, amount),
  executeSwap: (route, wallet) => ipcRenderer.invoke('execute-swap', route, wallet),
  executeDelayedSwap: (buyRoute, sellRoute, wallet, delayInSeconds) => 
    ipcRenderer.invoke('execute-delayed-swap', buyRoute, sellRoute, wallet, delayInSeconds),
  
  // Solana blockchain methods
  fetchSolanaPrice: async () => {
    try {
      // Για την desktop εφαρμογή χρησιμοποιούμε ένα public API για τιμές
      // Σε πραγματική εφαρμογή θα συνδεόταν με το Solana blockchain
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      return {
        price: data.solana.usd,
        change: Math.random() * 6 - 3 // Προσομοίωση αλλαγής τιμής
      };
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return { price: 150 + (Math.random() * 10 - 5), change: Math.random() * 6 - 3 };
    }
  },
  
  fetchTokenPrice: async (tokenSymbol) => {
    // Προσομοίωση τιμής για το HPEPE token
    if (tokenSymbol.toLowerCase() === 'hpepe') {
      return {
        price: 0.00001 + (Math.random() * 0.000005),
        change: Math.random() * 10 - 5
      };
    }
    return { price: 0, change: 0 };
  },
  
  fetchTokenDetails: async (tokenAddress) => {
    // Προσομοίωση λεπτομερειών για ένα token
    return ipcRenderer.invoke('fetch-token-details', tokenAddress);
  },
  
  // Wallet methods
  connectWallet: async (walletAddress) => {
    // Σε πραγματική εφαρμογή αυτό θα συνδεόταν με το Solana wallet
    return {
      connected: true,
      address: walletAddress || 'DummyWalletAddress123456789',
      balance: {
        sol: 10 + (Math.random() * 5),
        hpepe: 100000 + (Math.random() * 50000)
      }
    };
  },
  
  disconnectWallet: async () => {
    return { connected: false };
  },
  
  // Transaction history methods
  getTransactionHistory: () => ipcRenderer.invoke('get-transaction-history'),
  
  // Market maker methods
  startMakerBot: (settings) => ipcRenderer.invoke('start-maker-bot', settings),
  stopMakerBot: () => ipcRenderer.invoke('stop-maker-bot')
}); 