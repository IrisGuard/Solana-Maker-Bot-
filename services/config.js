// Διαμόρφωση του Solana Maker Bot
// Εδώ μπορείτε να προσθέσετε τα κλειδιά σας από το rork.app

export const CONFIG = {
  // Solana RPC Endpoints
  SOLANA_RPC_ENDPOINT: 'https://api.mainnet-beta.solana.com',
  
  // API Keys - Ενημερωμένα κλειδιά από το api-keys.js
  RORK_APP_KEY: 'το-κλειδί-σας-εδώ', // Ενημερώστε με το πραγματικό κλειδί
  RORK_APP_SECRET: 'το-μυστικό-σας-εδώ', // Ενημερώστε με το πραγματικό μυστικό
  
  // Jupiter API
  JUPITER_API_ENDPOINT: 'https://quote-api.jup.ag/v6',
  
  // Wallet configuration
  SIMULATION_MODE: true, // Set to false for real transactions
  MAX_TRANSACTIONS_PER_DAY: 100,
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  
  // Token configuration
  TOKEN_LIST_URL: 'https://token.jup.ag/strict',
  DEFAULT_TOKENS: ['SOL', 'HPEPE', 'BONK'],
  
  // HPEPE Token address (προσθέτουμε το default HPEPE token address)
  HPEPE_TOKEN_ADDRESS: 'Gs4vY1rJSv9SfEZGZbTN6BNNv64JG3DBHJwZKKLb8Qae'
};

// Τοπικές ρυθμίσεις που θα αποθηκεύονται στο localStorage
export const DEFAULT_SETTINGS = {
  simulationMode: true,
  darkMode: true,
  language: 'el',
  maxTransactionsPerDay: 100,
  minDelay: 5,
  maxDelay: 10,
  autoBoost: false,
  apiEndpoint: 'https://api.mainnet-beta.solana.com',
  confirmTransactions: true,
  transactionLimit: 1.0,
  notifications: true,
};

// Διαμόρφωση του bot
export const BOT_CONFIG = {
  // Boost parameters
  BOOST_LEVELS: [
    { name: 'Χαμηλή', percent: 0.1, description: 'Μικρή αύξηση 0.1%' },
    { name: 'Μεσαία', percent: 0.5, description: 'Μέτρια αύξηση 0.5%' },
    { name: 'Υψηλή', percent: 1.0, description: 'Σημαντική αύξηση 1.0%' },
    { name: 'Πολύ υψηλή', percent: 2.0, description: 'Μεγάλη αύξηση 2.0%' }
  ],
  
  // Transaction settings
  MIN_TRANSACTION_AMOUNT_SOL: 0.001,
  MAX_TRANSACTION_AMOUNT_SOL: 5.0,
  
  // Price impact settings
  MAX_PRICE_IMPACT: 3.0, // 3.0%
};

// Μέθοδος για την ασφαλή αποθήκευση των κλειδιών
export const setApiKeys = (rorkAppKey, rorkAppSecret) => {
  if (typeof window !== 'undefined') {
    try {
      // Αποθήκευση των κλειδιών με κρυπτογράφηση (απλοποιημένο)
      // Σε παραγωγικό περιβάλλον θα χρησιμοποιήσετε κάποιο πιο ασφαλές σύστημα
      const encryptedRorkKey = btoa(rorkAppKey);
      const encryptedRorkSecret = btoa(rorkAppSecret);
      
      localStorage.setItem('rork_key', encryptedRorkKey);
      localStorage.setItem('rork_secret', encryptedRorkSecret);
      
      return true;
    } catch (error) {
      console.error('Failed to save API keys:', error);
      return false;
    }
  }
  return false;
};

// Μέθοδος για την ανάκτηση των κλειδιών
export const getApiKeys = () => {
  if (typeof window !== 'undefined') {
    try {
      // Πρώτα έλεγχος για περιβαλλοντικές μεταβλητές (Vercel)
      if (typeof process !== 'undefined' && process.env) {
        const envRorkKey = process.env.RORK_APP_KEY;
        const envRorkSecret = process.env.RORK_APP_SECRET;
        
        if (envRorkKey && envRorkSecret) {
          return { rorkAppKey: envRorkKey, rorkAppSecret: envRorkSecret };
        }
      }
      
      // Αν δεν βρέθηκαν περιβαλλοντικές μεταβλητές, έλεγχος localStorage
      const encryptedRorkKey = localStorage.getItem('rork_key');
      const encryptedRorkSecret = localStorage.getItem('rork_secret');
      
      if (!encryptedRorkKey || !encryptedRorkSecret) {
        return { rorkAppKey: CONFIG.RORK_APP_KEY, rorkAppSecret: CONFIG.RORK_APP_SECRET };
      }
      
      // Αποκρυπτογράφηση των κλειδιών (απλοποιημένο)
      const rorkAppKey = atob(encryptedRorkKey);
      const rorkAppSecret = atob(encryptedRorkSecret);
      
      return { rorkAppKey, rorkAppSecret };
    } catch (error) {
      console.error('Failed to retrieve API keys:', error);
      return { rorkAppKey: '', rorkAppSecret: '' };
    }
  }
  return { rorkAppKey: '', rorkAppSecret: '' };
}; 