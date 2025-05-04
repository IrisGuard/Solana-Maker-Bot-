// Supabase wallet type
export interface SupabaseWallet {
  id?: number;
  address: string;
  provider?: string;
  sol_balance?: number;
  hpepe_balance?: number;
  last_connected?: string;
  created_at?: string;
}

// Supabase transaction type
export interface SupabaseTransaction {
  id?: number;
  wallet_address: string;
  type: 'purchase' | 'sale';
  amount: number;
  currency: string;
  tokens: number;
  token_currency: string;
  maker?: string;
  signature?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp?: string;
  created_at?: string;
}

// Supabase token type
export interface SupabaseToken {
  id?: number;
  wallet_address: string;
  address: string;
  symbol: string;
  name: string;
  balance?: number;
  price?: number;
  last_updated?: string;
  created_at?: string;
}

// Solana API types
export interface SolanaBalance {
  sol: number;
  hpepe: number;
}

export interface SolanaTokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: number;
  price?: number;
}

export interface SolanaTransaction {
  txHash: string;
  blockTime: number;
  status: string;
  fee: number;
  signer: string;
  tokenTransfers?: {
    source: string;
    destination: string;
    amount: number;
    token: string;
  }[];
}

// Solscan API types
export interface SolanaPrice {
  price: number;
  change?: number;
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply?: number;
  priceUsdt?: string;
  supply?: {
    circulating: number;
    total: number;
    max: number;
  };
}

export interface TokenHolder {
  address: string;
  amount: number;
  decimals: number;
  owner: string;
  rank: number;
}

// CoinGecko API types
export interface CoinGeckoPrice {
  price: number;
  change: number;
}

export interface CoinGeckoHistoricalData {
  prices: number[];
  labels: string[];
}

// API Status types
export interface ApiEndpoint {
  name: string;
  status: 'active' | 'inactive';
}

export interface ApiStatus {
  working: number;
  total: number;
  endpoints: ApiEndpoint[];
  lastChecked: number;
}