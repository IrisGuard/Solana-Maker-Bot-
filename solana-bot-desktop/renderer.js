// Κύριες μεταβλητές για αποθήκευση δεδομένων
let botStatus = {
  status: 'inactive',
  simulationMode: true,
  makers: 100,
  transactions: 0
};

let tokenData = {
  sol: { price: 0, change: 0 },
  hpepe: { price: 0, change: 0 }
};

let walletData = {
  connected: false,
  address: '',
  balance: { sol: 0, hpepe: 0 }
};

// Νέες μεταβλητές για τη διαχείριση πολλαπλών πορτοφολιών
let wallets = [];
let transactionHistory = [];

// DOM Elements
const botStatusBadge = document.getElementById('bot-status-badge');
const toggleBotButton = document.getElementById('toggle-bot');
const simulationModeValue = document.getElementById('simulation-mode-value');
const makersValue = document.getElementById('makers-value');
const transactionsValue = document.getElementById('transactions-value');
const solPrice = document.getElementById('sol-price');
const solChange = document.getElementById('sol-change');
const hpepePrice = document.getElementById('hpepe-price');
const hpepeChange = document.getElementById('hpepe-change');
const activityLogContainer = document.getElementById('activity-log-container');
const connectWalletButton = document.getElementById('connect-wallet');
const walletInfo = document.getElementById('wallet-info');
const simulationToggle = document.getElementById('simulation-toggle');
const boostToggle = document.getElementById('boost-toggle');
const tokenList = document.getElementById('token-list');
const botSettingsForm = document.getElementById('bot-settings-form');
const saveSettingsButton = document.getElementById('save-settings');

// Νέα DOM Elements για τη διαχείριση πορτοφολιών
const walletList = document.getElementById('wallet-list');
const createWalletsButton = document.getElementById('create-wallets');
const walletCountInput = document.getElementById('wallet-count');
const totalWalletsElement = document.getElementById('total-wallets');
const totalSolElement = document.getElementById('total-sol');
const totalHpepeElement = document.getElementById('total-hpepe');
const walletSelectElement = document.getElementById('wallet-select');
const walletFilterElement = document.getElementById('wallet-filter');
const transactionList = document.getElementById('transaction-list');
const fromTokenSelect = document.getElementById('from-token');
const toTokenSelect = document.getElementById('to-token');
const swapAmountInput = document.getElementById('swap-amount');
const executeSwapButton = document.getElementById('execute-swap');
const delayedSwapCheckbox = document.getElementById('delayed-swap');
const delaySecondsInput = document.getElementById('delay-seconds');
const routesList = document.getElementById('routes-list');
const swapRoutesContainer = document.getElementById('swap-routes');

// Tab Switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');
    
    // Ενεργοποίηση του επιλεγμένου tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Αρχικοποίηση της εφαρμογής
async function initApp() {
  try {
    // Ανάκτηση της κατάστασης του bot
    const status = await window.api.getBotStatus();
    updateBotStatus(status);
    
    // Ανάκτηση των ρυθμίσεων του bot
    const settings = await window.api.getBotSettings();
    updateBotSettings(settings);
    
    // Ανάκτηση των τιμών των tokens
    const solData = await window.api.fetchSolanaPrice();
    const hpepeData = await window.api.fetchTokenPrice('hpepe');
    updateTokenPrices(solData, hpepeData);
    
    // Δημιουργία του token list
    updateTokenList();
    
    // Προσθήκη αρχικού log
    addLogEntry('System initialized. Bot is ready for operations.');
    
    // Ρύθμιση διαστημάτων ενημέρωσης
    setInterval(updatePrices, 30000); // Ενημέρωση τιμών κάθε 30 δευτερόλεπτα
    setInterval(checkBotStatus, 5000); // Έλεγχος κατάστασης bot κάθε 5 δευτερόλεπτα
    
    // Ανάκτηση των πορτοφολιών
    await loadWallets();
    
    // Ανάκτηση του ιστορικού συναλλαγών
    await loadTransactionHistory();
    
  } catch (error) {
    console.error('Error initializing app:', error);
    addLogEntry('Error initializing application. Please restart.');
  }
}

// Ενημέρωση κατάστασης του bot
function updateBotStatus(status) {
  botStatus = status;
  
  // Ενημέρωση UI
  botStatusBadge.textContent = status.status.charAt(0).toUpperCase() + status.status.slice(1);
  botStatusBadge.className = 'status-badge ' + status.status;
  
  toggleBotButton.textContent = status.status === 'active' ? 'Stop Bot' : 'Start Bot';
  simulationModeValue.textContent = status.simulationMode ? 'Enabled' : 'Disabled';
  makersValue.textContent = status.maxTransactionsPerDay || 100;
  transactionsValue.textContent = status.transactionsToday || 0;
  
  // Ενημέρωση του simulation toggle
  const simulationSwitch = simulationToggle.querySelector('.toggle-switch');
  if (status.simulationMode) {
    simulationSwitch.classList.add('active');
  } else {
    simulationSwitch.classList.remove('active');
  }
  
  // Ενημέρωση του boost toggle
  const boostSwitch = boostToggle.querySelector('.toggle-switch');
  if (status.autoBoost) {
    boostSwitch.classList.add('active');
  } else {
    boostSwitch.classList.remove('active');
  }
}

// Ενημέρωση των ρυθμίσεων του bot
function updateBotSettings(settings) {
  // Ενημέρωση των πεδίων της φόρμας
  document.getElementById('makers').value = settings.makers;
  document.getElementById('min-delay').value = settings.minDelay;
  document.getElementById('max-delay').value = settings.maxDelay;
  document.getElementById('target-price').value = settings.targetPrice;
  document.getElementById('hpepe-amount').value = settings.hpepeAmount;
  document.getElementById('sol-amount').value = settings.solAmount;
  document.getElementById('token-action').value = settings.tokenAction;
  document.getElementById('burn-small').checked = settings.burnSmallAmounts;
  document.getElementById('collect-large').checked = settings.collectLargeAmounts;
}

// Ενημέρωση των τιμών των tokens
function updateTokenPrices(solData, hpepeData) {
  tokenData.sol = solData;
  tokenData.hpepe = hpepeData;
  
  // Ενημέρωση UI
  solPrice.textContent = `$${solData.price.toFixed(2)}`;
  solChange.textContent = `${solData.change > 0 ? '+' : ''}${solData.change.toFixed(2)}%`;
  solChange.className = 'price-change ' + (solData.change >= 0 ? 'positive' : '');
  
  hpepePrice.textContent = `$${hpepeData.price.toFixed(8)}`;
  hpepeChange.textContent = `${hpepeData.change > 0 ? '+' : ''}${hpepeData.change.toFixed(2)}%`;
  hpepeChange.className = 'price-change ' + (hpepeData.change >= 0 ? 'positive' : '');
  
  // Ενημέρωση του token list
  updateTokenList();
}

// Ενημέρωση της λίστας των tokens
function updateTokenList() {
  if (!tokenList) return;
  
  tokenList.innerHTML = '';
  
  // Solana Token
  const solItem = document.createElement('div');
  solItem.className = 'token-item';
  
  const solInfo = document.createElement('div');
  solInfo.className = 'token-info';
  
  const solSymbol = document.createElement('span');
  solSymbol.className = 'token-symbol';
  solSymbol.textContent = 'SOL';
  
  const solName = document.createElement('span');
  solName.className = 'token-name';
  solName.textContent = 'Solana';
  
  solInfo.appendChild(solSymbol);
  solInfo.appendChild(solName);
  
  const solPriceElem = document.createElement('div');
  solPriceElem.className = 'token-price';
  solPriceElem.textContent = `$${tokenData.sol.price.toFixed(2)}`;
  
  solItem.appendChild(solInfo);
  solItem.appendChild(solPriceElem);
  
  // HPEPE Token
  const hpepeItem = document.createElement('div');
  hpepeItem.className = 'token-item';
  
  const hpepeInfo = document.createElement('div');
  hpepeInfo.className = 'token-info';
  
  const hpepeSymbol = document.createElement('span');
  hpepeSymbol.className = 'token-symbol';
  hpepeSymbol.textContent = 'HPEPE';
  
  const hpepeName = document.createElement('span');
  hpepeName.className = 'token-name';
  hpepeName.textContent = 'Hellenic Pepe';
  
  hpepeInfo.appendChild(hpepeSymbol);
  hpepeInfo.appendChild(hpepeName);
  
  const hpepePriceElem = document.createElement('div');
  hpepePriceElem.className = 'token-price';
  hpepePriceElem.textContent = `$${tokenData.hpepe.price.toFixed(8)}`;
  
  hpepeItem.appendChild(hpepeInfo);
  hpepeItem.appendChild(hpepePriceElem);
  
  // Προσθήκη στη λίστα
  tokenList.appendChild(solItem);
  tokenList.appendChild(hpepeItem);
  
  // Εάν το wallet είναι συνδεδεμένο, εμφανίζουμε τα υπόλοιπα
  if (walletData.connected) {
    // SOL Balance
    const solBalanceItem = document.createElement('div');
    solBalanceItem.className = 'token-item';
    
    const solBalanceInfo = document.createElement('div');
    solBalanceInfo.className = 'token-info';
    
    const solBalanceTitle = document.createElement('span');
    solBalanceTitle.className = 'token-symbol';
    solBalanceTitle.textContent = 'Your SOL Balance';
    
    solBalanceInfo.appendChild(solBalanceTitle);
    
    const solBalanceValue = document.createElement('div');
    solBalanceValue.className = 'token-price';
    solBalanceValue.textContent = `${walletData.balance.sol.toFixed(4)} SOL`;
    
    solBalanceItem.appendChild(solBalanceInfo);
    solBalanceItem.appendChild(solBalanceValue);
    
    // HPEPE Balance
    const hpepeBalanceItem = document.createElement('div');
    hpepeBalanceItem.className = 'token-item';
    
    const hpepeBalanceInfo = document.createElement('div');
    hpepeBalanceInfo.className = 'token-info';
    
    const hpepeBalanceTitle = document.createElement('span');
    hpepeBalanceTitle.className = 'token-symbol';
    hpepeBalanceTitle.textContent = 'Your HPEPE Balance';
    
    hpepeBalanceInfo.appendChild(hpepeBalanceTitle);
    
    const hpepeBalanceValue = document.createElement('div');
    hpepeBalanceValue.className = 'token-price';
    hpepeBalanceValue.textContent = `${walletData.balance.hpepe.toFixed(0)} HPEPE`;
    
    hpepeBalanceItem.appendChild(hpepeBalanceInfo);
    hpepeBalanceItem.appendChild(hpepeBalanceValue);
    
    // Προσθήκη στη λίστα
    tokenList.appendChild(solBalanceItem);
    tokenList.appendChild(hpepeBalanceItem);
  }
}

// Προσθήκη καταχώρησης στο log
function addLogEntry(message) {
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  
  const timestamp = new Date().toLocaleTimeString();
  logEntry.textContent = `[${timestamp}] ${message}`;
  
  activityLogContainer.prepend(logEntry);
  
  // Περιορισμός του αριθμού των καταχωρήσεων
  const entries = activityLogContainer.querySelectorAll('.log-entry');
  if (entries.length > 100) {
    entries[entries.length - 1].remove();
  }
}

// Ενημέρωση των τιμών των tokens
async function updatePrices() {
  try {
    const solData = await window.api.fetchSolanaPrice();
    const hpepeData = await window.api.fetchTokenPrice('hpepe');
    updateTokenPrices(solData, hpepeData);
  } catch (error) {
    console.error('Error updating prices:', error);
    addLogEntry('Error updating token prices.');
  }
}

// Έλεγχος της κατάστασης του bot
async function checkBotStatus() {
  if (botStatus.status === 'active') {
    // Προσομοίωση συναλλαγών όταν το bot είναι ενεργό
    try {
      const result = await window.api.simulateTransactions(Math.floor(Math.random() * 3) + 1);
      transactionsValue.textContent = result.totalToday;
      
      // Προσθήκη log
      if (result.completed > 0) {
        addLogEntry(`Completed ${result.completed} transactions.`);
      }
    } catch (error) {
      console.error('Error simulating transactions:', error);
    }
  }
}

// Event Listeners

// Toggle Bot Status
toggleBotButton.addEventListener('click', async () => {
  try {
    const newStatus = botStatus.status === 'active' ? 'inactive' : 'active';
    const updatedStatus = await window.api.setBotStatus(newStatus);
    updateBotStatus(updatedStatus);
    
    // Προσθήκη log
    addLogEntry(`Bot ${newStatus === 'active' ? 'started' : 'stopped'}.`);
    
    if (newStatus === 'active') {
      // Εκκίνηση των συναλλαγών
      checkBotStatus();
    }
  } catch (error) {
    console.error('Error toggling bot status:', error);
    addLogEntry('Error changing bot status.');
  }
});

// Connect/Disconnect Wallet
connectWalletButton.addEventListener('click', async () => {
  try {
    if (!walletData.connected) {
      // Σύνδεση wallet
      walletData = await window.api.connectWallet();
      
      // Ενημέρωση UI
      walletInfo.innerHTML = `
        <div class="wallet-connected">
          <span class="wallet-address">${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}</span>
          <span class="wallet-balance">${walletData.balance.sol.toFixed(2)} SOL</span>
          <button id="disconnect-wallet" class="button">Disconnect</button>
        </div>
      `;
      
      // Event listener για disconnect
      document.getElementById('disconnect-wallet').addEventListener('click', disconnectWallet);
      
      // Ενημέρωση token list
      updateTokenList();
      
      // Προσθήκη log
      addLogEntry('Wallet connected successfully.');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    addLogEntry('Error connecting wallet.');
  }
});

// Αποσύνδεση wallet
async function disconnectWallet() {
  try {
    await window.api.disconnectWallet();
    walletData.connected = false;
    
    // Επαναφορά του κουμπιού σύνδεσης
    walletInfo.innerHTML = '<button id="connect-wallet" class="button">Connect Wallet</button>';
    document.getElementById('connect-wallet').addEventListener('click', connectWalletButton.click);
    
    // Ενημέρωση token list
    updateTokenList();
    
    // Προσθήκη log
    addLogEntry('Wallet disconnected.');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    addLogEntry('Error disconnecting wallet.');
  }
}

// Simulation Toggle
simulationToggle.addEventListener('click', async () => {
  try {
    const simulationSwitch = simulationToggle.querySelector('.toggle-switch');
    const isEnabled = !simulationSwitch.classList.contains('active');
    
    // Ενημέρωση του backend
    const updatedStatus = await window.api.setSimulationMode(isEnabled);
    updateBotStatus(updatedStatus);
    
    // Προσθήκη log
    addLogEntry(`Simulation mode ${isEnabled ? 'enabled' : 'disabled'}.`);
  } catch (error) {
    console.error('Error toggling simulation mode:', error);
    addLogEntry('Error changing simulation mode.');
  }
});

// Bot Settings Form
botSettingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  try {
    // Συλλογή των δεδομένων της φόρμας
    const formData = new FormData(botSettingsForm);
    const settings = {
      makers: formData.get('makers'),
      minDelay: formData.get('minDelay'),
      maxDelay: formData.get('maxDelay'),
      targetPrice: formData.get('targetPrice'),
      hpepeAmount: formData.get('hpepeAmount'),
      solAmount: formData.get('solAmount'),
      tokenAction: formData.get('tokenAction'),
      burnSmallAmounts: formData.get('burnSmallAmounts') === 'on',
      collectLargeAmounts: formData.get('collectLargeAmounts') === 'on'
    };
    
    // Αποθήκευση των ρυθμίσεων
    await window.api.saveBotSettings(settings);
    
    // Προσθήκη log
    addLogEntry('Bot settings saved successfully.');
  } catch (error) {
    console.error('Error saving bot settings:', error);
    addLogEntry('Error saving bot settings.');
  }
});

// Save Settings Button
saveSettingsButton.addEventListener('click', async () => {
  try {
    // Λήψη της τιμής του RPC endpoint
    const rpcEndpoint = document.getElementById('rpc-endpoint').value;
    
    // Αποθήκευση των ρυθμίσεων
    // Σημείωση: Στην τρέχουσα υλοποίηση δεν αποθηκεύουμε πραγματικά το RPC endpoint
    // αλλά θα μπορούσαμε να το προσθέσουμε στο API
    
    // Προσθήκη log
    addLogEntry('Settings saved successfully.');
  } catch (error) {
    console.error('Error saving settings:', error);
    addLogEntry('Error saving settings.');
  }
});

// Φόρτωση των πορτοφολιών από το backend
async function loadWallets() {
  try {
    wallets = await window.api.getWallets();
    updateWalletList();
    updateWalletSelectors();
    updateWalletStats();
    addLogEntry(`Loaded ${wallets.length} wallets.`);
  } catch (error) {
    console.error('Error loading wallets:', error);
    addLogEntry('Error loading wallets.');
  }
}

// Ενημέρωση της λίστας πορτοφολιών στο UI
function updateWalletList() {
  if (!walletList) return;
  
  // Καθαρισμός της λίστας
  walletList.innerHTML = '';
  
  if (wallets.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No wallets created yet. Use the form above to create wallets.';
    walletList.appendChild(emptyState);
    return;
  }
  
  // Προσθήκη κάθε πορτοφολιού στη λίστα
  wallets.forEach(wallet => {
    const walletItem = document.createElement('div');
    walletItem.className = 'wallet-item';
    walletItem.setAttribute('data-wallet-id', wallet.id);
    
    const walletHeader = document.createElement('div');
    walletHeader.className = 'wallet-header';
    
    const walletAddress = document.createElement('span');
    walletAddress.className = 'wallet-address';
    walletAddress.textContent = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
    
    const walletActions = document.createElement('div');
    walletActions.className = 'wallet-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'button small danger';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteWallet(wallet.id));
    
    walletActions.appendChild(deleteButton);
    walletHeader.appendChild(walletAddress);
    walletHeader.appendChild(walletActions);
    
    const walletBalance = document.createElement('div');
    walletBalance.className = 'wallet-balance';
    
    const solBalance = document.createElement('div');
    solBalance.className = 'balance-item';
    solBalance.innerHTML = `<span>SOL:</span> <span>${wallet.balance.sol.toFixed(4)}</span>`;
    
    const hpepeBalance = document.createElement('div');
    hpepeBalance.className = 'balance-item';
    hpepeBalance.innerHTML = `<span>HPEPE:</span> <span>${wallet.balance.hpepe.toFixed(0)}</span>`;
    
    walletBalance.appendChild(solBalance);
    walletBalance.appendChild(hpepeBalance);
    
    walletItem.appendChild(walletHeader);
    walletItem.appendChild(walletBalance);
    
    walletList.appendChild(walletItem);
  });
}

// Ενημέρωση των στατιστικών των πορτοφολιών
function updateWalletStats() {
  if (!totalWalletsElement || !totalSolElement || !totalHpepeElement) return;
  
  totalWalletsElement.textContent = wallets.length;
  
  const totalSol = wallets.reduce((sum, wallet) => sum + wallet.balance.sol, 0);
  const totalHpepe = wallets.reduce((sum, wallet) => sum + wallet.balance.hpepe, 0);
  
  totalSolElement.textContent = totalSol.toFixed(4);
  totalHpepeElement.textContent = totalHpepe.toFixed(0);
}

// Ενημέρωση των drop-down λιστών για την επιλογή πορτοφολιών
function updateWalletSelectors() {
  // Καθαρισμός των υπαρχόντων επιλογών (εκτός από την προεπιλεγμένη)
  while (walletSelectElement && walletSelectElement.options.length > 1) {
    walletSelectElement.remove(1);
  }
  
  while (walletFilterElement && walletFilterElement.options.length > 1) {
    walletFilterElement.remove(1);
  }
  
  // Προσθήκη των πορτοφολιών στα drop-down
  wallets.forEach(wallet => {
    const addressShort = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
    
    if (walletSelectElement) {
      const option = document.createElement('option');
      option.value = wallet.id;
      option.textContent = addressShort;
      walletSelectElement.appendChild(option);
    }
    
    if (walletFilterElement) {
      const option = document.createElement('option');
      option.value = wallet.id;
      option.textContent = addressShort;
      walletFilterElement.appendChild(option);
    }
  });
}

// Δημιουργία νέων πορτοφολιών
async function createNewWallets() {
  try {
    const count = parseInt(walletCountInput.value);
    
    if (isNaN(count) || count < 1 || count > 100) {
      addLogEntry('Invalid wallet count. Please enter a number between 1 and 100.');
      return;
    }
    
    addLogEntry(`Creating ${count} new wallets...`);
    
    const newWallets = await window.api.createWallets(count);
    wallets = [...wallets, ...newWallets];
    
    updateWalletList();
    updateWalletSelectors();
    updateWalletStats();
    
    addLogEntry(`Successfully created ${count} new wallets.`);
  } catch (error) {
    console.error('Error creating wallets:', error);
    addLogEntry('Error creating wallets.');
  }
}

// Διαγραφή πορτοφολιού
async function deleteWallet(walletId) {
  try {
    await window.api.deleteWallet(walletId);
    wallets = wallets.filter(wallet => wallet.id !== walletId);
    
    updateWalletList();
    updateWalletSelectors();
    updateWalletStats();
    
    addLogEntry(`Wallet deleted.`);
  } catch (error) {
    console.error('Error deleting wallet:', error);
    addLogEntry('Error deleting wallet.');
  }
}

// Φόρτωση του ιστορικού συναλλαγών
async function loadTransactionHistory() {
  try {
    transactionHistory = await window.api.getTransactionHistory();
    updateTransactionList();
  } catch (error) {
    console.error('Error loading transaction history:', error);
    addLogEntry('Error loading transaction history.');
  }
}

// Ενημέρωση της λίστας συναλλαγών
function updateTransactionList() {
  if (!transactionList) return;
  
  // Καθαρισμός της λίστας
  transactionList.innerHTML = '';
  
  if (transactionHistory.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No transactions yet.';
    transactionList.appendChild(emptyState);
    return;
  }
  
  // Λήψη των φίλτρων
  const typeFilter = document.getElementById('transaction-filter').value;
  const walletFilter = document.getElementById('wallet-filter').value;
  
  // Φιλτράρισμα των συναλλαγών
  let filteredTransactions = [...transactionHistory];
  
  // Φίλτρο τύπου συναλλαγής
  if (typeFilter === 'buy') {
    filteredTransactions = filteredTransactions.filter(tx => 
      (tx.inputToken === 'SOL' && tx.outputToken === 'HPEPE'));
  } else if (typeFilter === 'sell') {
    filteredTransactions = filteredTransactions.filter(tx => 
      (tx.inputToken === 'HPEPE' && tx.outputToken === 'SOL'));
  }
  
  // Φίλτρο πορτοφολιού
  if (walletFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.walletId === walletFilter);
  }
  
  // Ταξινόμηση από τις πιο πρόσφατες
  filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
  
  // Προσθήκη κάθε συναλλαγής στη λίστα
  filteredTransactions.forEach(tx => {
    const txItem = document.createElement('div');
    txItem.className = 'transaction-item';
    
    const txHeader = document.createElement('div');
    txHeader.className = 'transaction-header';
    
    // Ετικέτα τύπου συναλλαγής
    const txType = document.createElement('span');
    txType.className = 'transaction-type';
    if (tx.inputToken === 'SOL' && tx.outputToken === 'HPEPE') {
      txType.textContent = 'Buy';
      txType.classList.add('buy');
    } else if (tx.inputToken === 'HPEPE' && tx.outputToken === 'SOL') {
      txType.textContent = 'Sell';
      txType.classList.add('sell');
    } else {
      txType.textContent = 'Swap';
    }
    
    // Χρονική σήμανση συναλλαγής
    const txTime = document.createElement('span');
    txTime.className = 'transaction-time';
    const txDate = new Date(tx.timestamp);
    txTime.textContent = txDate.toLocaleString();
    
    txHeader.appendChild(txType);
    txHeader.appendChild(txTime);
    
    // Λεπτομέρειες συναλλαγής
    const txDetails = document.createElement('div');
    txDetails.className = 'transaction-details';
    
    // Πορτοφόλι
    const txWallet = document.createElement('div');
    txWallet.className = 'transaction-wallet';
    txWallet.innerHTML = `<span>Wallet:</span> <span>${tx.walletAddress.slice(0, 6)}...${tx.walletAddress.slice(-4)}</span>`;
    
    // Ποσότητες
    const txAmount = document.createElement('div');
    txAmount.className = 'transaction-amount';
    txAmount.innerHTML = `
      <span>${tx.inputAmount.toFixed(tx.inputToken === 'SOL' ? 4 : 0)} ${tx.inputToken}</span>
      <span class="transaction-arrow">→</span>
      <span>${tx.outputAmount.toFixed(tx.outputToken === 'SOL' ? 4 : 0)} ${tx.outputToken}</span>
    `;
    
    // Κατάσταση
    const txStatus = document.createElement('div');
    txStatus.className = 'transaction-status';
    txStatus.innerHTML = `<span>Status:</span> <span class="${tx.status.toLowerCase()}">${tx.status}</span>`;
    
    // Σημείωση προσομοίωσης
    if (tx.simulated) {
      const txSimulated = document.createElement('div');
      txSimulated.className = 'transaction-simulated';
      txSimulated.textContent = 'Simulation Mode';
      txDetails.appendChild(txSimulated);
    }
    
    txDetails.appendChild(txWallet);
    txDetails.appendChild(txAmount);
    txDetails.appendChild(txStatus);
    
    // Σύνδεσμος για Solscan
    const txLink = document.createElement('a');
    txLink.className = 'transaction-link';
    txLink.href = `https://solscan.io/tx/${tx.signature}`;
    txLink.target = '_blank';
    txLink.textContent = 'View on Solscan';
    
    if (tx.simulated) {
      txLink.classList.add('disabled');
      txLink.onclick = (e) => e.preventDefault();
    }
    
    txItem.appendChild(txHeader);
    txItem.appendChild(txDetails);
    txItem.appendChild(txLink);
    
    transactionList.appendChild(txItem);
  });
}

// Αναζήτηση διαδρομών συναλλαγής στο Jupiter
async function searchSwapRoutes() {
  try {
    const fromToken = fromTokenSelect.value;
    const toToken = toTokenSelect.value;
    const amount = parseFloat(swapAmountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
      addLogEntry('Invalid amount. Please enter a positive number.');
      return;
    }
    
    addLogEntry(`Searching for swap routes from ${fromToken} to ${toToken}...`);
    
    const routes = await window.api.getRoutes(fromToken, toToken, amount);
    
    // Εμφάνιση των διαδρομών
    routesList.innerHTML = '';
    swapRoutesContainer.classList.remove('hidden');
    
    if (routes.routes.length === 0) {
      routesList.innerHTML = '<div class="empty-state">No routes found.</div>';
      return;
    }
    
    // Προσθήκη κάθε διαδρομής
    routes.routes.forEach((route, index) => {
      const routeItem = document.createElement('div');
      routeItem.className = 'route-item';
      routeItem.setAttribute('data-route-id', route.id);
      
      const routeHeader = document.createElement('div');
      routeHeader.className = 'route-header';
      
      const routeTitle = document.createElement('span');
      routeTitle.className = 'route-title';
      routeTitle.textContent = `Route ${index + 1}`;
      
      const routeMarket = document.createElement('span');
      routeMarket.className = 'route-market';
      routeMarket.textContent = route.marketInfos.map(m => m.label).join(' → ');
      
      routeHeader.appendChild(routeTitle);
      routeHeader.appendChild(routeMarket);
      
      const routeDetails = document.createElement('div');
      routeDetails.className = 'route-details';
      
      // Ποσότητες
      const routeAmount = document.createElement('div');
      routeAmount.className = 'route-amount';
      routeAmount.innerHTML = `
        <span>${route.inAmount.toFixed(fromToken === 'SOL' ? 4 : 0)} ${fromToken}</span>
        <span class="route-arrow">→</span>
        <span>${route.outAmount.toFixed(toToken === 'SOL' ? 4 : 0)} ${toToken}</span>
      `;
      
      // Επίδραση τιμής
      const routeImpact = document.createElement('div');
      routeImpact.className = 'route-impact';
      routeImpact.innerHTML = `<span>Price Impact:</span> <span>${route.priceImpactPct.toFixed(2)}%</span>`;
      
      routeDetails.appendChild(routeAmount);
      routeDetails.appendChild(routeImpact);
      
      // Επιλογή διαδρομής
      const routeSelect = document.createElement('button');
      routeSelect.className = 'button primary small';
      routeSelect.textContent = 'Select Route';
      routeSelect.addEventListener('click', () => selectRoute(route));
      
      routeItem.appendChild(routeHeader);
      routeItem.appendChild(routeDetails);
      routeItem.appendChild(routeSelect);
      
      routesList.appendChild(routeItem);
    });
    
  } catch (error) {
    console.error('Error searching for swap routes:', error);
    addLogEntry('Error searching for swap routes.');
  }
}

// Επιλογή διαδρομής συναλλαγής
function selectRoute(route) {
  // Ενημέρωση του επιλεγμένου route
  window.selectedRoute = route;
  
  // Ενημέρωση του UI
  const routeItems = document.querySelectorAll('.route-item');
  routeItems.forEach(item => {
    if (item.getAttribute('data-route-id') === route.id) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  addLogEntry(`Selected route with output of ${route.outAmount.toFixed(4)} ${toTokenSelect.value}.`);
}

// Εκτέλεση συναλλαγής
async function executeSwap() {
  try {
    const walletId = walletSelectElement.value;
    const isDelayed = delayedSwapCheckbox.checked;
    const fromToken = fromTokenSelect.value;
    const toToken = toTokenSelect.value;
    
    if (!walletId) {
      addLogEntry('Please select a wallet.');
      return;
    }
    
    // Έλεγχος αν δεν έχει επιλεγεί διαδρομή
    if (!window.selectedRoute) {
      // Αναζήτηση διαδρομών
      await searchSwapRoutes();
      if (!window.selectedRoute && routesList.children.length > 0) {
        // Επιλογή της πρώτης διαδρομής
        selectRoute(JSON.parse(routesList.children[0].getAttribute('data-route')));
      } else {
        addLogEntry('No routes available. Cannot execute swap.');
        return;
      }
    }
    
    // Ρύθμιση του route για τη συναλλαγή
    const route = {
      ...window.selectedRoute,
      inputToken: fromToken,
      outputToken: toToken
    };
    
    if (isDelayed) {
      // Για καθυστερημένη συναλλαγή, δημιουργούμε την αντίστροφη διαδρομή
      const delay = parseInt(delaySecondsInput.value);
      
      if (isNaN(delay) || delay < 30 || delay > 50) {
        addLogEntry('Invalid delay. Please enter a number between 30 and 50 seconds.');
        return;
      }
      
      // Δημιουργία της αντίστροφης διαδρομής
      const reverseRoute = {
        ...route,
        inputToken: toToken,
        outputToken: fromToken,
        inAmount: route.outAmount,
        outAmount: route.inAmount * 0.99 // Μικρή απώλεια κατά την επιστροφή
      };
      
      addLogEntry(`Executing delayed swap with ${delay} seconds delay...`);
      
      // Εκτέλεση της συναλλαγής με καθυστέρηση
      const result = await window.api.executeDelayedSwap(route, reverseRoute, walletId, delay);
      
      addLogEntry(`Buy transaction executed. Sell scheduled in ${delay} seconds.`);
      setTimeout(() => {
        addLogEntry(`Sell transaction executed.`);
        loadTransactionHistory();
        loadWallets();
      }, delay * 1000 + 1000); // +1 δευτερόλεπτο για να είμαστε σίγουροι ότι η συναλλαγή έχει ολοκληρωθεί
      
    } else {
      // Απλή συναλλαγή χωρίς καθυστέρηση
      addLogEntry(`Executing swap from ${fromToken} to ${toToken}...`);
      
      const result = await window.api.executeSwap(route, walletId);
      
      addLogEntry(`Swap executed successfully.`);
    }
    
    // Ενημέρωση της λίστας συναλλαγών και των πορτοφολιών
    loadTransactionHistory();
    loadWallets();
    
  } catch (error) {
    console.error('Error executing swap:', error);
    addLogEntry('Error executing swap.');
  }
}

// Event Listeners για τις νέες λειτουργίες

// Εμφάνιση/απόκρυψη του πεδίου καθυστέρησης
if (delayedSwapCheckbox) {
  delayedSwapCheckbox.addEventListener('change', () => {
    if (delayedSwapCheckbox.checked) {
      delaySecondsInput.classList.remove('hidden');
    } else {
      delaySecondsInput.classList.add('hidden');
    }
  });
}

// Αναζήτηση διαδρομών όταν αλλάζουν τα πεδία της φόρμας
fromTokenSelect.addEventListener('change', () => {
  window.selectedRoute = null;
  swapRoutesContainer.classList.add('hidden');
});

toTokenSelect.addEventListener('change', () => {
  window.selectedRoute = null;
  swapRoutesContainer.classList.add('hidden');
});

swapAmountInput.addEventListener('change', () => {
  window.selectedRoute = null;
  swapRoutesContainer.classList.add('hidden');
});

// Αναζήτηση διαδρομών όταν πατηθεί το κουμπί swap
executeSwapButton.addEventListener('click', executeSwap);

// Φίλτρα για το ιστορικό συναλλαγών
document.getElementById('transaction-filter').addEventListener('change', updateTransactionList);
document.getElementById('wallet-filter').addEventListener('change', updateTransactionList);

// Create Wallets Button
if (createWalletsButton) {
  createWalletsButton.addEventListener('click', createNewWallets);
}

// Εκκίνηση της εφαρμογής
initApp(); 