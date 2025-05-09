import axios from 'axios';
import { getApiKeys, CONFIG } from './config';

// Βασικό URL για το RORK.app API
const RORK_API_BASE_URL = 'https://api.rork.app/v1';

/**
 * Δημιουργεί ένα instance του axios με τα απαραίτητα headers 
 * για το RORK.app API
 */
const getRorkApiClient = () => {
  const { rorkAppKey, rorkAppSecret } = getApiKeys();
  
  if (!rorkAppKey || !rorkAppSecret) {
    throw new Error('Missing RORK.app API keys. Please add them in settings.');
  }
  
  return axios.create({
    baseURL: RORK_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': rorkAppKey,
      'X-Api-Secret': rorkAppSecret
    }
  });
};

/**
 * Δημιουργεί μία maker συναλλαγή στο RORK.app
 * 
 * @param {Object} params - Παράμετροι για τη δημιουργία maker
 * @param {string} params.walletAddress - Διεύθυνση του πορτοφολιού
 * @param {string} params.tokenAddress - Διεύθυνση του token
 * @param {number} params.solAmount - Ποσό SOL για τη συναλλαγή
 * @param {number} params.delay - Καθυστέρηση σε δευτερόλεπτα (προαιρετικό)
 * @returns {Promise<Object>} - Η απάντηση από το API
 */
export const createMaker = async ({ walletAddress, tokenAddress, solAmount, delay = 0 }) => {
  try {
    const apiClient = getRorkApiClient();
    
    const response = await apiClient.post('/maker/create', {
      wallet_address: walletAddress,
      token_address: tokenAddress,
      sol_amount: solAmount,
      delay: delay
    });
    
    return {
      success: true,
      data: response.data,
      txId: response.data.transaction_id || 'pending'
    };
  } catch (error) {
    console.error('Error creating maker on RORK.app:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Δημιουργεί πολλαπλές maker συναλλαγές
 * 
 * @param {Object} params - Παράμετροι για τη δημιουργία makers
 * @param {string} params.walletAddress - Διεύθυνση του πορτοφολιού
 * @param {string} params.tokenAddress - Διεύθυνση του token
 * @param {number} params.totalSolAmount - Συνολικό ποσό SOL
 * @param {number} params.numMakers - Αριθμός makers που θα δημιουργηθούν
 * @param {number} params.minDelay - Ελάχιστη καθυστέρηση σε δευτερόλεπτα
 * @param {number} params.maxDelay - Μέγιστη καθυστέρηση σε δευτερόλεπτα
 * @returns {Promise<Object>} - Η απάντηση από το API
 */
export const createMultipleMakers = async ({ 
  walletAddress, 
  tokenAddress, 
  totalSolAmount, 
  numMakers, 
  minDelay, 
  maxDelay 
}) => {
  try {
    const apiClient = getRorkApiClient();
    
    const response = await apiClient.post('/maker/create-multiple', {
      wallet_address: walletAddress,
      token_address: tokenAddress,
      total_sol_amount: totalSolAmount,
      num_makers: numMakers,
      min_delay: minDelay,
      max_delay: maxDelay
    });
    
    return {
      success: true,
      data: response.data,
      transactions: response.data.transactions || []
    };
  } catch (error) {
    console.error('Error creating multiple makers on RORK.app:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Δημιουργεί μια συναλλαγή boost για αύξηση της τιμής
 * 
 * @param {Object} params - Παράμετροι για τη δημιουργία boost
 * @param {string} params.walletAddress - Διεύθυνση του πορτοφολιού
 * @param {string} params.tokenAddress - Διεύθυνση του token
 * @param {number} params.solAmount - Ποσό SOL για το boost
 * @returns {Promise<Object>} - Η απάντηση από το API
 */
export const createBoost = async ({ walletAddress, tokenAddress, solAmount }) => {
  try {
    const apiClient = getRorkApiClient();
    
    const response = await apiClient.post('/boost/create', {
      wallet_address: walletAddress,
      token_address: tokenAddress,
      sol_amount: solAmount
    });
    
    return {
      success: true,
      data: response.data,
      txId: response.data.transaction_id || 'pending',
      estimatedImpact: response.data.estimated_impact || 0
    };
  } catch (error) {
    console.error('Error creating boost on RORK.app:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Λαμβάνει το ιστορικό συναλλαγών
 * 
 * @param {Object} params - Παράμετροι για το ιστορικό
 * @param {string} params.walletAddress - Διεύθυνση του πορτοφολιού
 * @param {number} params.limit - Όριο αποτελεσμάτων (προαιρετικό)
 * @param {number} params.offset - Μετατόπιση αποτελεσμάτων (προαιρετικό)
 * @returns {Promise<Object>} - Η απάντηση από το API με το ιστορικό
 */
export const getTransactionHistory = async ({ walletAddress, limit = 50, offset = 0 }) => {
  try {
    const apiClient = getRorkApiClient();
    
    const response = await apiClient.get('/transactions/history', {
      params: {
        wallet_address: walletAddress,
        limit,
        offset
      }
    });
    
    return {
      success: true,
      data: response.data,
      transactions: response.data.transactions || []
    };
  } catch (error) {
    console.error('Error getting transaction history from RORK.app:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Αποκτά τη λίστα των υποστηριζόμενων tokens
 * 
 * @returns {Promise<Object>} - Η απάντηση από το API με τα tokens
 */
export const getSupportedTokens = async () => {
  try {
    const apiClient = getRorkApiClient();
    
    const response = await apiClient.get('/tokens/supported');
    
    return {
      success: true,
      data: response.data,
      tokens: response.data.tokens || []
    };
  } catch (error) {
    console.error('Error getting supported tokens from RORK.app:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}; 