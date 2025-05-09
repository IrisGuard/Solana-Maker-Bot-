import { getApiKeys } from '../../services/config';
import { API_KEYS } from '../../services/api-keys';

export default async function handler(req, res) {
  try {
    // Λήψη των API keys
    const { rorkAppKey } = getApiKeys();
    
    // Χρήση των CoinGecko API για πραγματικές τιμές αν υπάρχει το κλειδί
    if (API_KEYS.EXPO_PUBLIC_COINGECKO_API_KEY) {
      try {
        // Fetch SOL price from CoinGecko
        const solResponse = await fetch(
          `${API_KEYS.EXPO_PUBLIC_COINGECKO_API_URL}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&x_cg_api_key=${API_KEYS.EXPO_PUBLIC_COINGECKO_API_KEY}`
        );
        
        if (!solResponse.ok) throw new Error('CoinGecko API error');
        
        const solData = await solResponse.json();
        
        // Εφόσον το HPEPE είναι μικρότερο token και μπορεί να μην είναι στο CoinGecko,
        // θα χρησιμοποιήσουμε προσομοιωμένα δεδομένα για αυτό
        const hpepePrice = 0.00001 + (Math.random() * 0.000005);
        
        res.status(200).json({
          sol: {
            price: solData.solana.usd,
            change: solData.solana.usd_24h_change.toFixed(2)
          },
          hpepe: {
            price: hpepePrice,
            change: (Math.random() * 10 - 5).toFixed(2)
          }
        });
        return;
      } catch (error) {
        console.error('Error fetching from CoinGecko:', error);
        // Σε περίπτωση σφάλματος, συνεχίζουμε με τα προσομοιωμένα δεδομένα
      }
    }
    
    // Fallback: Προσομοιωμένα δεδομένα
    const solanaPrice = 150 + (Math.random() * 10 - 5);
    const hpepePrice = 0.00001 + (Math.random() * 0.000005);
    
    res.status(200).json({
      sol: {
        price: solanaPrice,
        change: (Math.random() * 6 - 3).toFixed(2)
      },
      hpepe: {
        price: hpepePrice,
        change: (Math.random() * 10 - 5).toFixed(2)
      }
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 