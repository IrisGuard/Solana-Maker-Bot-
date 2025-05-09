import { API_KEYS } from '../../services/api-keys';

export default async function handler(req, res) {
  try {
    // Έλεγχος αν έχουμε τα απαραίτητα Supabase API keys
    const supabaseUrl = API_KEYS.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = API_KEYS.EXPO_PUBLIC_SUPABASE_KEY;
    
    // Έλεγχος αν παρέχεται η διεύθυνση του πορτοφολιού
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Σε παραγωγικό περιβάλλον, θα κάναμε αίτημα στο Solana RPC για να λάβουμε το πραγματικό υπόλοιπο
    // Για την εφαρμογή επίδειξης, χρησιμοποιούμε προσομοιωμένα δεδομένα
    
    // Δημιουργία σταθερού αναγνωριστικού από τη διεύθυνση για συνεπή τιμή προσομοίωσης
    let addressSeed = 0;
    for (let i = 0; i < address.length; i++) {
      addressSeed += address.charCodeAt(i);
    }
    
    // Χρήση του seed για προσομοίωση συνεπών τιμών για την ίδια διεύθυνση
    const random = () => {
      const x = Math.sin(addressSeed++) * 10000;
      return x - Math.floor(x);
    };
    
    // Προσομοίωση υπολοίπου SOL με βάση τη διεύθυνση
    const solBalance = 10 + (random() * 20);
    
    // Προσομοίωση υπολοίπου HPEPE με βάση τη διεύθυνση
    const hpepeBalance = 100000 + (random() * 900000);
    
    // Προσομοίωση άλλων tokens
    const tokens = [
      {
        symbol: 'BONK',
        name: 'Bonk',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        balance: 1000000 + (random() * 9000000),
        decimals: 6
      },
      {
        symbol: 'RAY',
        name: 'Raydium',
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        balance: 10 + (random() * 90),
        decimals: 8
      }
    ];
    
    res.status(200).json({
      sol: {
        balance: solBalance.toFixed(4),
        usdValue: (solBalance * 150).toFixed(2) // Απλή προσομοίωση με σταθερή τιμή
      },
      hpepe: {
        balance: Math.floor(hpepeBalance),
        usdValue: (hpepeBalance * 0.00001).toFixed(2)
      },
      tokens,
      walletConnected: true
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 