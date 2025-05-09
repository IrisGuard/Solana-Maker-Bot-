import { getApiKeys } from '../../services/config';
import { CONFIG } from '../../services/config';
import { API_KEYS } from '../../services/api-keys';

// Διατήρηση του ιστορικού των συναλλαγών σε memory (σε παραγωγή θα χρησιμοποιούσαμε βάση δεδομένων)
const transactionHistory = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Λήψη των API keys
    const { rorkAppKey, rorkAppSecret } = getApiKeys();
    
    // Έλεγχος αν υπάρχουν τα απαιτούμενα πεδία στο request
    const { 
      tokenAddress, 
      amount, 
      price, 
      side, // 'buy' ή 'sell'
      walletAddress
    } = req.body;
    
    // Βασικός έλεγχος παραμέτρων
    if (!tokenAddress || !amount || !price || !side || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }
    
    // Έλεγχος αν το side είναι έγκυρο
    if (side !== 'buy' && side !== 'sell') {
      return res.status(400).json({ 
        success: false, 
        error: 'Side must be either "buy" or "sell"' 
      });
    }
    
    // Σε παραγωγικό περιβάλλον, θα επικοινωνούσαμε με το blockchain
    // Για την εφαρμογή επίδειξης, απλά προσομοιώνουμε τη συναλλαγή
    
    // Προσομοίωση πιθανότητας επιτυχίας της συναλλαγής
    const isSuccess = Math.random() > 0.2; // 80% πιθανότητα επιτυχίας
    
    if (!isSuccess) {
      return res.status(200).json({
        success: false,
        error: 'Transaction failed. Please try again.'
      });
    }
    
    // Δημιουργία αναγνωριστικού συναλλαγής
    const txId = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    
    // Υπολογισμός συνολικού κόστους/αξίας της συναλλαγής
    const totalValue = amount * price;
    
    // Προσθήκη στο ιστορικό συναλλαγών
    const transaction = {
      id: txId,
      tokenAddress,
      tokenSymbol: tokenAddress === CONFIG.HPEPE_TOKEN_ADDRESS ? 'HPEPE' : 'Unknown',
      amount: parseFloat(amount),
      price: parseFloat(price),
      totalValue,
      side,
      walletAddress,
      timestamp: Date.now(),
      status: 'confirmed',
      blockNumber: Math.floor(Math.random() * 1000000) + 200000000,
      fee: 0.000005 * Math.random()
    };
    
    transactionHistory.push(transaction);
    
    // Περιορισμός του ιστορικού στις τελευταίες 100 συναλλαγές
    if (transactionHistory.length > 100) {
      transactionHistory.shift();
    }
    
    // Επιστροφή επιτυχημένης απάντησης
    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Helper function για την εξαγωγή του ιστορικού συναλλαγών
export const getTransactionHistory = () => {
  return [...transactionHistory];
}; 