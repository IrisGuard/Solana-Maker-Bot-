import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SupabaseWallet, SupabaseTransaction, SupabaseToken } from '@/types/api';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a custom storage adapter for AsyncStorage
const asyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Check if Supabase URL and key are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create Supabase client only if URL and key are available
export const supabase = isSupabaseConfigured 
  ? createClient(
      supabaseUrl, 
      supabaseAnonKey,
      {
        auth: {
          storage: Platform.OS === 'web' ? localStorage : asyncStorageAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web',
        },
      }
    )
  : null;

// Helper function to extract error message from Supabase error
export const getErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.error_description) return error.error_description;
  
  if (error.details) return error.details;
  
  if (error.error) return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  
  return JSON.stringify(error);
};

// Wallet table operations
export const walletOperations = {
  // Get wallet by address
  getWallet: async (address: string): Promise<SupabaseWallet | null> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', address)
        .single();
      
      if (error) {
        console.warn('Error getting wallet:', error.message);
        return null;
      }
      
      return data;
    } catch (err) {
      console.warn('Exception getting wallet:', err);
      return null;
    }
  },
  
  // Create or update wallet
  upsertWallet: async (wallet: SupabaseWallet): Promise<SupabaseWallet | null> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .upsert({
          ...wallet,
          last_connected: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.warn('Error upserting wallet:', error.message);
        return null;
      }
      
      return data[0] || null;
    } catch (err) {
      console.warn('Exception upserting wallet:', err);
      return null;
    }
  },
};

// Transaction table operations
export const transactionOperations = {
  // Get transactions by wallet address
  getTransactions: async (address: string, limit = 20): Promise<SupabaseTransaction[]> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', address)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Error getting transactions:', error.message);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.warn('Exception getting transactions:', err);
      return [];
    }
  },
  
  // Add a transaction
  addTransaction: async (transaction: SupabaseTransaction): Promise<SupabaseTransaction | null> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          timestamp: transaction.timestamp || new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.warn('Error adding transaction:', error.message);
        return null;
      }
      
      return data[0] || null;
    } catch (err) {
      console.warn('Exception adding transaction:', err);
      return null;
    }
  },
};

// Token table operations
export const tokenOperations = {
  // Get tokens by wallet address
  getTokens: async (address: string): Promise<SupabaseToken[]> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('wallet_address', address);
      
      if (error) {
        console.warn('Error getting tokens:', error.message);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.warn('Exception getting tokens:', err);
      return [];
    }
  },
  
  // Add or update a token
  upsertToken: async (token: SupabaseToken): Promise<SupabaseToken | null> => {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('tokens')
        .upsert({
          ...token,
          last_updated: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.warn('Error upserting token:', error.message);
        return null;
      }
      
      return data[0] || null;
    } catch (err) {
      console.warn('Exception upserting token:', err);
      return null;
    }
  },
};

// Initialize Supabase tables if they don't exist
export const initializeSupabase = async () => {
  if (!supabase) {
    console.warn('Supabase client not initialized - missing URL or API key');
    return false;
  }
  
  try {
    // Test connection
    const { data, error } = await supabase.from('wallets').select('count');
    
    if (error) {
      console.warn('Error testing Supabase connection:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('Exception testing Supabase connection:', error);
    return false;
  }
};

// Create tables if they don't exist
export const createTables = async () => {
  if (!supabase) {
    console.warn('Supabase client not initialized - missing URL or API key');
    return false;
  }
  
  try {
    console.log('Checking if tables exist...');
    
    // Check if tables exist first
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('count');
    
    if (walletError) {
      console.log('Wallets table does not exist, creating...');
      // Create wallets table
      const { error: createWalletError } = await supabase.rpc('create_wallets_table_if_not_exists');
      if (createWalletError) {
        console.warn('Error creating wallets table via RPC:', createWalletError.message);
        // Fallback: Try direct SQL
        await createWalletsTable();
      }
    } else {
      console.log('Wallets table exists');
    }
    
    // Check transactions table
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('count');
    
    if (txError) {
      console.log('Transactions table does not exist, creating...');
      // Create transactions table
      const { error: createTxError } = await supabase.rpc('create_transactions_table_if_not_exists');
      if (createTxError) {
        console.warn('Error creating transactions table via RPC:', createTxError.message);
        // Fallback: Try direct SQL
        await createTransactionsTable();
      }
    } else {
      console.log('Transactions table exists');
    }
    
    // Check tokens table
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('count');
    
    if (tokenError) {
      console.log('Tokens table does not exist, creating...');
      // Create tokens table
      const { error: createTokenError } = await supabase.rpc('create_tokens_table_if_not_exists');
      if (createTokenError) {
        console.warn('Error creating tokens table via RPC:', createTokenError.message);
        // Fallback: Try direct SQL
        await createTokensTable();
      }
    } else {
      console.log('Tokens table exists');
    }
    
    console.log('Table creation completed');
    return true;
  } catch (error) {
    console.warn('Exception creating tables:', error);
    return false;
  }
};

// Fallback: Create wallets table directly
const createWalletsTable = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    console.log('Creating wallets table via SQL...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS wallets (
          id SERIAL PRIMARY KEY,
          address TEXT NOT NULL UNIQUE,
          provider TEXT,
          sol_balance FLOAT,
          hpepe_balance FLOAT,
          last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.warn('Error creating wallets table via SQL:', error.message);
      return false;
    }
    
    console.log('Wallets table created successfully');
    return true;
  } catch (error) {
    console.warn('Exception creating wallets table:', error);
    return false;
  }
};

// Fallback: Create transactions table directly
const createTransactionsTable = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    console.log('Creating transactions table via SQL...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          wallet_address TEXT NOT NULL,
          type TEXT NOT NULL,
          amount FLOAT NOT NULL,
          currency TEXT NOT NULL,
          tokens FLOAT NOT NULL,
          token_currency TEXT NOT NULL,
          maker TEXT,
          signature TEXT,
          status TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.warn('Error creating transactions table via SQL:', error.message);
      return false;
    }
    
    console.log('Transactions table created successfully');
    return true;
  } catch (error) {
    console.warn('Exception creating transactions table:', error);
    return false;
  }
};

// Fallback: Create tokens table directly
const createTokensTable = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    console.log('Creating tokens table via SQL...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS tokens (
          id SERIAL PRIMARY KEY,
          wallet_address TEXT NOT NULL,
          address TEXT NOT NULL,
          symbol TEXT NOT NULL,
          name TEXT NOT NULL,
          balance FLOAT,
          price FLOAT,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(wallet_address, address)
        );
      `
    });
    
    if (error) {
      console.warn('Error creating tokens table via SQL:', error.message);
      return false;
    }
    
    console.log('Tokens table created successfully');
    return true;
  } catch (error) {
    console.warn('Exception creating tokens table:', error);
    return false;
  }
};