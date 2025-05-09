const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();
const crypto = require('crypto');

// Δημιουργία αποθήκευσης για την κατάσταση του bot
if (!store.get('botStatus')) {
  store.set('botStatus', {
    status: 'inactive',
    simulationMode: true,
    autoBoost: false,
    maxTransactionsPerDay: 100,
    transactionsToday: 0,
    lastActive: null
  });
}

// Δημιουργία αποθήκευσης για τις ρυθμίσεις του bot
if (!store.get('botSettings')) {
  store.set('botSettings', {
    mode: 'boost',
    targetPrice: '0.0001',
    makers: '100',
    hpepeAmount: '2000',
    solAmount: '0.175',
    minOrderAmount: '0.001',
    maxOrderAmount: '0.002',
    minDelay: '30',
    maxDelay: '50',
    tokenAction: 'sell',
    burnSmallAmounts: true,
    collectLargeAmounts: true,
    returnAfterCount: 50,
  });
}

// Δημιουργία αποθήκευσης για τα πορτοφόλια
if (!store.get('wallets')) {
  store.set('wallets', []);
}

// Δημιουργία αποθήκευσης για το ιστορικό συναλλαγών
if (!store.get('transactionHistory')) {
  store.set('transactionHistory', []);
}

let mainWindow;
// Αντικείμενο για την αποθήκευση των τρεχόντων εργασιών του bot
let botTasks = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Uncomment για debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC listeners για επικοινωνία με το renderer process

// Λήψη της κατάστασης του bot
ipcMain.handle('get-bot-status', () => {
  return store.get('botStatus');
});

// Αλλαγή της κατάστασης του bot
ipcMain.handle('set-bot-status', (event, status) => {
  const botStatus = store.get('botStatus');
  botStatus.status = status;
  if (status === 'active') {
    botStatus.lastActive = Date.now();
  }
  store.set('botStatus', botStatus);
  return botStatus;
});

// Αλλαγή της λειτουργίας simulation
ipcMain.handle('set-simulation-mode', (event, enabled) => {
  const botStatus = store.get('botStatus');
  botStatus.simulationMode = enabled;
  store.set('botStatus', botStatus);
  return botStatus;
});

// Λήψη των ρυθμίσεων του bot
ipcMain.handle('get-bot-settings', () => {
  return store.get('botSettings');
});

// Αποθήκευση των ρυθμίσεων του bot
ipcMain.handle('save-bot-settings', (event, settings) => {
  store.set('botSettings', settings);
  return settings;
});

// Διαχείριση πορτοφολιών

// Δημιουργία νέων πορτοφολιών
ipcMain.handle('create-wallets', (event, count) => {
  const wallets = store.get('wallets') || [];
  const newWallets = [];
  
  for (let i = 0; i < count; i++) {
    const id = crypto.randomBytes(16).toString('hex');
    const address = `wallet_${crypto.randomBytes(20).toString('hex')}`;
    const privateKey = crypto.randomBytes(32).toString('hex');
    
    const newWallet = {
      id,
      address,
      privateKey,
      balance: {
        sol: 1 + Math.random() * 2, // Προσομοίωση ποσού SOL
        hpepe: 10000 + Math.random() * 20000 // Προσομοίωση ποσού HPEPE
      },
      createdAt: Date.now()
    };
    
    newWallets.push(newWallet);
  }
  
  const updatedWallets = [...wallets, ...newWallets];
  store.set('wallets', updatedWallets);
  
  // Επιστρέφουμε μόνο τις public πληροφορίες των πορτοφολιών
  return newWallets.map(wallet => ({
    id: wallet.id,
    address: wallet.address,
    balance: wallet.balance,
    createdAt: wallet.createdAt
  }));
});

// Λήψη όλων των πορτοφολιών
ipcMain.handle('get-wallets', () => {
  const wallets = store.get('wallets') || [];
  // Επιστρέφουμε μόνο τις public πληροφορίες
  return wallets.map(wallet => ({
    id: wallet.id,
    address: wallet.address,
    balance: wallet.balance,
    createdAt: wallet.createdAt
  }));
});

// Διαγραφή πορτοφολιού
ipcMain.handle('delete-wallet', (event, walletId) => {
  const wallets = store.get('wallets') || [];
  const updatedWallets = wallets.filter(wallet => wallet.id !== walletId);
  store.set('wallets', updatedWallets);
  return true;
});

// Jupiter Aggregator

// Λήψη διαθέσιμων διαδρομών συναλλαγής
ipcMain.handle('get-routes', (event, inputMint, outputMint, amount) => {
  // Σε πραγματική εφαρμογή, αυτό θα έκανε κλήση στο Jupiter API
  // Επιστρέφουμε προσομοιωμένα δεδομένα
  return {
    routes: [
      {
        id: crypto.randomBytes(8).toString('hex'),
        inAmount: amount,
        outAmount: amount * (Math.random() * 0.01 + 0.99), // ±1% διακύμανση
        marketInfos: [{ label: 'Raydium' }],
        priceImpactPct: Math.random() * 0.5,
        slippageBps: 50
      },
      {
        id: crypto.randomBytes(8).toString('hex'),
        inAmount: amount,
        outAmount: amount * (Math.random() * 0.01 + 0.98), // ±2% διακύμανση
        marketInfos: [{ label: 'Orca' }],
        priceImpactPct: Math.random() * 0.6,
        slippageBps: 30
      }
    ]
  };
});

// Εκτέλεση συναλλαγής
ipcMain.handle('execute-swap', (event, route, walletId) => {
  const botStatus = store.get('botStatus');
  const wallets = store.get('wallets') || [];
  const transactionHistory = store.get('transactionHistory') || [];
  
  // Αναζήτηση του πορτοφολιού
  const walletIndex = wallets.findIndex(w => w.id === walletId);
  if (walletIndex === -1) {
    throw new Error('Wallet not found');
  }
  
  // Προσομοίωση συναλλαγής
  const isSimulated = botStatus.simulationMode;
  const timestamp = Date.now();
  const signature = `signature_${crypto.randomBytes(16).toString('hex')}`;
  
  // Προσομοίωση αλλαγής υπολοίπου του πορτοφολιού
  if (route.inputToken === 'SOL' && route.outputToken === 'HPEPE') {
    wallets[walletIndex].balance.sol -= route.inAmount;
    wallets[walletIndex].balance.hpepe += route.outAmount;
  } else if (route.inputToken === 'HPEPE' && route.outputToken === 'SOL') {
    wallets[walletIndex].balance.hpepe -= route.inAmount;
    wallets[walletIndex].balance.sol += route.outAmount;
  }
  
  // Αποθήκευση της συναλλαγής στο ιστορικό
  const transaction = {
    id: crypto.randomBytes(16).toString('hex'),
    signature,
    walletId,
    walletAddress: wallets[walletIndex].address,
    inputToken: route.inputToken,
    inputAmount: route.inAmount,
    outputToken: route.outputToken,
    outputAmount: route.outAmount,
    timestamp,
    simulated: isSimulated,
    status: 'completed'
  };
  
  transactionHistory.push(transaction);
  
  // Αποθήκευση των ενημερωμένων δεδομένων
  store.set('wallets', wallets);
  store.set('transactionHistory', transactionHistory);
  
  // Αύξηση του μετρητή συναλλαγών
  botStatus.transactionsToday += 1;
  store.set('botStatus', botStatus);
  
  return transaction;
});

// Εκτέλεση συναλλαγής με καθυστέρηση (αγορά και πώληση με καθυστέρηση)
ipcMain.handle('execute-delayed-swap', async (event, buyRoute, sellRoute, walletId, delayInSeconds) => {
  // Πρώτα εκτελούμε την αγορά
  const buyResult = await ipcMain.handle('execute-swap', event, buyRoute, walletId);
  
  // Προγραμματισμός της πώλησης μετά από καθυστέρηση
  const taskId = setTimeout(async () => {
    try {
      await ipcMain.handle('execute-swap', event, sellRoute, walletId);
      delete botTasks[taskId]; // Αφαίρεση της εργασίας από τη λίστα
    } catch (error) {
      console.error('Error executing delayed sell swap:', error);
    }
  }, delayInSeconds * 1000);
  
  // Αποθήκευση της εργασίας για πιθανή ακύρωση
  botTasks[taskId] = {
    type: 'delayed_swap',
    walletId,
    buyTransaction: buyResult.id,
    sellRoute
  };
  
  return { 
    taskId, 
    buyTransaction: buyResult,
    scheduledSell: Date.now() + (delayInSeconds * 1000)
  };
});

// Λήψη ιστορικού συναλλαγών
ipcMain.handle('get-transaction-history', () => {
  return store.get('transactionHistory') || [];
});

// Λήψη λεπτομερειών για ένα token
ipcMain.handle('fetch-token-details', (event, tokenAddress) => {
  // Προσομοίωση λεπτομερειών για το token
  return {
    address: tokenAddress,
    name: tokenAddress === 'HPEPE' ? 'Hellenic Pepe' : 'Unknown Token',
    symbol: tokenAddress === 'HPEPE' ? 'HPEPE' : 'UNK',
    decimals: 9,
    totalSupply: 1000000000000,
    holders: 2500 + Math.floor(Math.random() * 500),
    transactions: 15000 + Math.floor(Math.random() * 3000)
  };
});

// Έναρξη του Market Maker Bot
ipcMain.handle('start-maker-bot', (event, settings) => {
  const botStatus = store.get('botStatus');
  const wallets = store.get('wallets') || [];
  
  if (wallets.length === 0) {
    throw new Error('No wallets available');
  }
  
  // Ενημέρωση της κατάστασης του bot
  botStatus.status = 'active';
  botStatus.lastActive = Date.now();
  store.set('botStatus', botStatus);
  
  // Προγραμματισμός αυτόματων συναλλαγών με καθυστέρηση
  const interval = setInterval(async () => {
    try {
      if (botStatus.status !== 'active') {
        clearInterval(interval);
        return;
      }
      
      // Επιλογή τυχαίου πορτοφολιού
      const randomWalletIndex = Math.floor(Math.random() * wallets.length);
      const wallet = wallets[randomWalletIndex];
      
      // Δημιουργία τυχαίων παραμέτρων συναλλαγής
      const inputToken = Math.random() > 0.5 ? 'SOL' : 'HPEPE';
      const outputToken = inputToken === 'SOL' ? 'HPEPE' : 'SOL';
      
      // Προσδιορισμός ποσότητας
      let amount;
      if (inputToken === 'SOL') {
        amount = Math.min(wallet.balance.sol * 0.1, parseFloat(settings.solAmount));
      } else {
        amount = Math.min(wallet.balance.hpepe * 0.1, parseFloat(settings.hpepeAmount));
      }
      
      // Λήψη διαδρομών συναλλαγής
      const routes = await ipcMain.handle('get-routes', event, inputToken, outputToken, amount);
      
      // Επιλογή της καλύτερης διαδρομής
      const bestRoute = routes.routes[0];
      bestRoute.inputToken = inputToken;
      bestRoute.outputToken = outputToken;
      
      // Εκτέλεση συναλλαγής
      await ipcMain.handle('execute-swap', event, bestRoute, wallet.id);
      
      // Καθυστέρηση και επιστροφή (αντίστροφη συναλλαγή)
      const delay = Math.floor(Math.random() * 
        (parseInt(settings.maxDelay) - parseInt(settings.minDelay) + 1)) + 
        parseInt(settings.minDelay);
      
      // Δημιουργία αντίστροφης διαδρομής
      const reverseRoute = {
        ...bestRoute,
        inputToken: outputToken,
        outputToken: inputToken,
        inAmount: bestRoute.outAmount,
        outAmount: bestRoute.inAmount * 0.99 // Μικρή απώλεια κατά την επιστροφή
      };
      
      setTimeout(async () => {
        try {
          await ipcMain.handle('execute-swap', event, reverseRoute, wallet.id);
        } catch (err) {
          console.error('Error executing reverse swap:', err);
        }
      }, delay * 1000);
      
    } catch (error) {
      console.error('Error in maker bot execution:', error);
    }
  }, 10000); // Εκτέλεση κάθε 10 δευτερόλεπτα
  
  return { status: 'active', startTime: Date.now() };
});

// Διακοπή του Market Maker Bot
ipcMain.handle('stop-maker-bot', () => {
  const botStatus = store.get('botStatus');
  botStatus.status = 'inactive';
  store.set('botStatus', botStatus);
  
  // Ακύρωση όλων των εκκρεμών εργασιών
  Object.keys(botTasks).forEach(taskId => {
    clearTimeout(parseInt(taskId));
    delete botTasks[taskId];
  });
  
  return { status: 'inactive', stopTime: Date.now() };
});

// Προσομοίωση των συναλλαγών
ipcMain.handle('simulate-transactions', async (event, count) => {
  const botStatus = store.get('botStatus');
  const botSettings = store.get('botSettings');
  
  // Αύξηση των συναλλαγών
  botStatus.transactionsToday += count;
  store.set('botStatus', botStatus);
  
  // Επιστρέφουμε τα αποτελέσματα των συναλλαγών
  return {
    completed: count,
    totalToday: botStatus.transactionsToday
  };
}); 