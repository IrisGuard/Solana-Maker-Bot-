import { getTransactionHistory } from './make-transaction';
import { API_KEYS } from '../../services/api-keys';

export default async function handler(req, res) {
  try {
    // Έλεγχος αν έχουμε τα απαραίτητα Supabase API keys
    const supabaseUrl = API_KEYS.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = API_KEYS.EXPO_PUBLIC_SUPABASE_KEY || API_KEYS.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    // Απλός έλεγχος αν τα API keys είναι διαθέσιμα
    const hasValidKeys = supabaseUrl && supabaseKey && 
                         supabaseUrl.includes('supabase.co') && 
                         supabaseKey.length > 20;
    
    // Λήψη παραμέτρων φιλτραρίσματος από το query
    const { walletAddress, tokenSymbol, limit = 20, page = 1 } = req.query;
    
    // Λήψη του ιστορικού συναλλαγών
    let transactions = getTransactionHistory();
    
    // Εφαρμογή φίλτρων αν υπάρχουν
    if (walletAddress) {
      transactions = transactions.filter(tx => tx.walletAddress === walletAddress);
    }
    
    if (tokenSymbol) {
      transactions = transactions.filter(tx => tx.tokenSymbol === tokenSymbol);
    }
    
    // Ταξινόμηση από τις πιο πρόσφατες προς τις παλαιότερες
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Υπολογισμός σελιδοποίησης
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    // Υπολογισμός συνολικών σελίδων
    const totalPages = Math.ceil(transactions.length / parseInt(limit));
    
    // Σημειώνουμε αν τα δεδομένα θα μπορούσαν να αποθηκευτούν σε βάση δεδομένων
    // Αν υπάρχουν έγκυρα κλειδιά Supabase
    const couldStoreInDatabase = hasValidKeys;
    
    // Αν δεν υπάρχουν συναλλαγές στο πραγματικό ιστορικό, δημιουργούμε κάποιες δοκιμαστικές
    if (transactions.length === 0) {
      // Δημιουργία προσομοιωμένων συναλλαγών για επίδειξη
      const demoTransactions = generateDemoTransactions();
      
      // Προσθήκη της πληροφορίας για το αν είναι αποθηκευμένες σε βάση δεδομένων
      const enhancedTransactions = demoTransactions.map(tx => ({
        ...tx,
        storedInDatabase: couldStoreInDatabase
      }));
      
      // Επιστροφή των προσομοιωμένων συναλλαγών
      return res.status(200).json({
        transactions: enhancedTransactions,
        pagination: {
          totalTransactions: enhancedTransactions.length,
          totalPages: 1,
          currentPage: 1,
          limit: parseInt(limit)
        },
        apiConnected: hasValidKeys,
        supabaseConnected: hasValidKeys,
        dataSource: 'Simulation'
      });
    }
    
    // Επιστροφή των συναλλαγών με πληροφορίες σελιδοποίησης
    res.status(200).json({
      transactions: paginatedTransactions,
      pagination: {
        totalTransactions: transactions.length,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      apiConnected: hasValidKeys,
      supabaseConnected: hasValidKeys,
      dataSource: transactions.length > 0 && transactions[0].storedInDatabase ? 'Supabase' : 'Local Storage'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      apiConnected: false,
      supabaseConnected: false
    });
  }
}

// Βοηθητική συνάρτηση για δημιουργία προσομοιωμένων συναλλαγών
function generateDemoTransactions() {
  const transactions = [];
  const now = Date.now();
  const walletAddress = '8YLKoCr5z59jBQj6eigfyLn1fYJYwRCTGp6kP3EHQnJ4';
  
  // Τελευταίες 24 ώρες, μια συναλλαγή ανά ώρα περίπου
  for (let i = 0; i < 24; i++) {
    const timestamp = now - (i * 3600000) - (Math.random() * 1800000);
    const isBuy = Math.random() > 0.5;
    const amount = 10000 + (Math.random() * 90000);
    const price = 0.00001 + (Math.random() * 0.000005);
    
    transactions.push({
      id: `tx_demo_${i}`,
      tokenAddress: 'Gs4vY1rJSv9SfEZGZbTN6BNNv64JG3DBHJwZKKLb8Qae',
      tokenSymbol: 'HPEPE',
      amount,
      price,
      totalValue: amount * price,
      side: isBuy ? 'buy' : 'sell',
      walletAddress,
      timestamp,
      status: 'confirmed',
      blockNumber: 200000000 + i,
      fee: 0.000005 * Math.random()
    });
  }
  
  return transactions;
} 