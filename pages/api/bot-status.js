import { API_KEYS } from '../../services/api-keys';
import { CONFIG } from '../../services/config';

// Εδώ θα μπορούσαμε να χρησιμοποιήσουμε μια βάση δεδομένων σε παραγωγικό περιβάλλον
// Για αυτή την εφαρμογή, χρησιμοποιούμε ένα απλό αντικείμενο για αποθήκευση της κατάστασης
const botState = {
  status: 'inactive',
  lastActive: null,
  simulationMode: CONFIG.SIMULATION_MODE,
  autoBoost: false,
  maxTransactionsPerDay: CONFIG.MAX_TRANSACTIONS_PER_DAY,
  transactionsToday: 0,
  requiredSol: 0.5,
  requiredHpepe: 100000,
  lastUpdated: Date.now()
};

export default async function handler(req, res) {
  try {
    // Έλεγχος αν έχουμε τα απαραίτητα Supabase API keys
    const supabaseUrl = API_KEYS.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = API_KEYS.EXPO_PUBLIC_SUPABASE_KEY || API_KEYS.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    // Απλός έλεγχος αν τα API keys είναι διαθέσιμα (δεν κάνουμε πραγματική σύνδεση προς το παρόν)
    const hasValidKeys = supabaseUrl && supabaseKey && 
                         supabaseUrl.includes('supabase.co') && 
                         supabaseKey.length > 20;
    
    // Για το POST request, επιτρέπουμε τις αλλαγές μόνο σε simulation mode αν δεν έχουμε έγκυρα κλειδιά
    if (req.method === 'POST' && !hasValidKeys) {
      botState.simulationMode = true;
    }
    
    if (req.method === 'GET') {
      // Πρόσθεση κάποιων τυχαίων συναλλαγών κάθε φορά που ελέγχεται η κατάσταση,
      // εάν το bot είναι ενεργό και σε λειτουργία προσομοίωσης
      if (botState.status === 'active' && botState.simulationMode) {
        const timeSinceLastUpdate = Date.now() - botState.lastUpdated;
        // Προσθήκη συναλλαγών με βάση το χρόνο που πέρασε (περίπου 1 συναλλαγή κάθε 10 δευτερόλεπτα)
        const newTransactions = Math.floor(timeSinceLastUpdate / 10000);
        if (newTransactions > 0) {
          botState.transactionsToday = Math.min(
            botState.maxTransactionsPerDay, 
            botState.transactionsToday + newTransactions
          );
          botState.lastUpdated = Date.now();
        }
      }
      
      // Επιστρέφουμε την τρέχουσα κατάσταση με πληροφορίες σύνδεσης
      res.status(200).json({
        ...botState,
        apiConnected: hasValidKeys,
        supbaseConnected: hasValidKeys,
        lastUpdated: Date.now()
      });
    } else if (req.method === 'POST') {
      // Ενημερώνουμε την κατάσταση με βάση το request body
      const { status, simulationMode, maxTransactionsPerDay, autoBoost } = req.body;
      
      if (status && ['active', 'inactive', 'paused'].includes(status)) {
        botState.status = status;
        botState.lastActive = status === 'active' ? Date.now() : botState.lastActive;
      }
      
      if (simulationMode !== undefined) {
        botState.simulationMode = !!simulationMode;
      }
      
      if (maxTransactionsPerDay !== undefined && maxTransactionsPerDay > 0) {
        botState.maxTransactionsPerDay = Math.min(500, Math.max(1, maxTransactionsPerDay));
      }
      
      if (autoBoost !== undefined) {
        botState.autoBoost = !!autoBoost;
      }
      
      // Αν ενεργοποιείται το bot, επαναφέρουμε τις συναλλαγές στο 0
      if (status === 'active' && botState.status !== 'active') {
        botState.transactionsToday = 0;
      }
      
      botState.lastUpdated = Date.now();
      
      // Επιστρέφουμε την ενημερωμένη κατάσταση
      res.status(200).json({
        ...botState,
        apiConnected: hasValidKeys,
        supabaseConnected: hasValidKeys,
        lastUpdated: Date.now()
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      apiConnected: false,
      supabaseConnected: false
    });
  }
} 