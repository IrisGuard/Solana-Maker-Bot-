import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ApiEndpoint } from '@/types/api';

// Define the bot status type
export type BotStatusType = 'active' | 'inactive' | 'paused';

// Define the bot settings type
export interface BotSettings {
  mode: 'boost' | 'target' | 'advanced';
  targetPrice: string;
  makers: string;
  hpepeAmount: string;
  solAmount: string;
  minOrderAmount: string;
  maxOrderAmount: string;
  minDelay: string;
  maxDelay: string;
  tokenAction: 'sell' | 'return';
  sellTiming: 'each' | 'all';
  manualBoost: string;
  autoBoost: boolean;
  burnSmallAmounts: boolean;
  collectLargeAmounts: boolean;
  returnAfterCount: number;
}

// Define the token data interface
export interface TokenData {
  sol: {
    price: number;
    change: number;
  };
  hpepe: {
    price: number;
    change: number;
    address: string;
  };
}

// Define the chart data interface
export interface ChartData {
  labels: string[];
  prices: number[];
}

// Define the user token interface
export interface UserToken {
  symbol: string;
  name: string;
  address: string;
  price: number;
  change24h?: number;
}

// Define the bot status interface
export interface BotStatus {
  status: BotStatusType;
  lastActive: number | null;
  simulationMode: boolean;
  autoBoost: boolean;
  maxTransactionsPerDay: number;
  transactionsToday: number;
  requiredSol?: number;
  requiredHpepe?: number;
}

// Define the API status interface
export interface ApiStatus {
  working: number;
  total: number;
  endpoints: ApiEndpoint[];
  lastChecked: number | null;
  status?: 'ok' | 'warning' | 'error';
}

// Define the wallet interface
export interface Wallet {
  connected: boolean;
  address: string;
  balance: {
    sol: number;
    hpepe: number;
    total: number;
  };
  tokens: Array<{
    symbol: string;
    name: string;
    balance: number;
    price: number;
    change24h: number;
  }>;
}

interface WalletState {
  address: string | null;
  balance: number;
  initialized: boolean;
  error: string | null;
  isConnecting: boolean;
  isSimulated: boolean;
  isLoading: boolean;
  
  // Token data
  tokenData: TokenData;
  chartData: ChartData;
  userTokens: UserToken[];
  
  // Bot settings
  botSettings: BotSettings;
  setBotSettings: (settings: Partial<BotSettings>) => void;
  
  // Bot status
  botStatus: BotStatus | null;
  setBotStatus: (status: BotStatusType) => void;
  setSimulationMode: (enabled: boolean) => void;
  
  // API status
  apiStatus: ApiStatus | null;
  checkApiStatus: () => Promise<void>;
  
  // Wallet
  wallet: Wallet;
  
  // Token actions
  fetchSolanaTokenPrice: () => Promise<void>;
  fetchHpepeTokenPrice: () => Promise<void>;
  fetchSolanaHistoricalPrices: () => Promise<void>;
  updateTokenPrice: (address: string, price: number) => void;
  removeToken: (address: string) => void;
  
  // Actions
  initialize: () => Promise<void>;
  connect: (address: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshBalances: () => Promise<void>;
}

// Default token data
const DEFAULT_TOKEN_DATA: TokenData = {
  sol: {
    price: 150.0,
    change: 2.5
  },
  hpepe: {
    price: 0.00001,
    change: 5.0,
    address: '8pBc4v9GAwCBNWPB5XKA93APexMGAS4qMr37vNke9Ref' // Example Solana token address
  }
};

// Default chart data
const DEFAULT_CHART_DATA: ChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  prices: [145, 148, 152, 149, 153, 156, 150]
};

// Default user tokens
const DEFAULT_USER_TOKENS: UserToken[] = [
  {
    symbol: 'HPEPE',
    name: 'Hellenic Pepe',
    address: '8pBc4v9GAwCBNWPB5XKA93APexMGAS4qMr37vNke9Ref',
    price: 0.00001,
    change24h: 5.0
  }
];

// Default bot settings
const DEFAULT_BOT_SETTINGS: BotSettings = {
  mode: 'boost',
  targetPrice: '0.0001',
  makers: '100',
  hpepeAmount: '2000',
  solAmount: '0.175',
  minOrderAmount: '0.001',
  maxOrderAmount: '0.002',
  minDelay: '5',
  maxDelay: '10',
  tokenAction: 'sell',
  sellTiming: 'each',
  manualBoost: '0',
  autoBoost: false,
  burnSmallAmounts: true,
  collectLargeAmounts: true,
  returnAfterCount: 50,
};

// Default wallet
const DEFAULT_WALLET: Wallet = {
  connected: false,
  address: '',
  balance: {
    sol: 0,
    hpepe: 0,
    total: 0
  },
  tokens: []
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      balance: 0,
      initialized: false,
      error: null,
      isConnecting: false,
      isSimulated: false,
      isLoading: false,
      
      // Token data - initialize with default values
      tokenData: DEFAULT_TOKEN_DATA,
      chartData: DEFAULT_CHART_DATA,
      userTokens: DEFAULT_USER_TOKENS,
      
      // Bot settings - initialize with default values
      botSettings: DEFAULT_BOT_SETTINGS,
      
      // Bot status
      botStatus: {
        status: 'inactive',
        lastActive: null,
        simulationMode: true,
        autoBoost: false,
        maxTransactionsPerDay: 100,
        transactionsToday: 0,
        requiredSol: 0.5,
        requiredHpepe: 100000
      },
      
      // API status
      apiStatus: {
        working: 0,
        total: 0,
        endpoints: [],
        lastChecked: null
      },
      
      // Wallet - initialize with default values
      wallet: DEFAULT_WALLET,
      
      // Set bot settings
      setBotSettings: (settings: Partial<BotSettings>) => {
        set(state => ({
          botSettings: { ...state.botSettings, ...settings }
        }));
      },
      
      // Token actions
      fetchSolanaTokenPrice: async () => {
        try {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate random price for demo
          const randomPrice = 150 + (Math.random() * 10 - 5);
          const randomChange = Math.random() * 6 - 3;
          
          set(state => ({ 
            tokenData: {
              ...state.tokenData,
              sol: {
                price: randomPrice,
                change: randomChange
              }
            },
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to fetch Solana price:', error);
          set({ 
            error: 'Failed to fetch Solana price',
            isLoading: false
          });
        }
      },
      
      fetchHpepeTokenPrice: async () => {
        try {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate random price for demo
          const randomPrice = 0.00001 + (Math.random() * 0.000005);
          const randomChange = Math.random() * 10 - 5;
          
          set(state => ({ 
            tokenData: {
              ...state.tokenData,
              hpepe: {
                ...state.tokenData.hpepe,
                price: randomPrice,
                change: randomChange
              }
            },
            isLoading: false
          }));
          
          // Also update the token in userTokens
          get().updateTokenPrice(get().tokenData.hpepe.address, randomPrice);
        } catch (error) {
          console.error('Failed to fetch HPEPE price:', error);
          set({ 
            error: 'Failed to fetch HPEPE price',
            isLoading: false
          });
        }
      },
      
      fetchSolanaHistoricalPrices: async () => {
        try {
          set({ isLoading: true });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate random historical prices for demo
          const basePrice = 150;
          const randomPrices = Array(7).fill(0).map(() => basePrice + (Math.random() * 10 - 5));
          
          set({ 
            chartData: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              prices: randomPrices
            },
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to fetch historical prices:', error);
          set({ 
            error: 'Failed to fetch historical prices',
            isLoading: false
          });
        }
      },
      
      updateTokenPrice: (address: string, price: number) => {
        set(state => ({
          userTokens: state.userTokens.map(token => 
            token.address === address ? { ...token, price } : token
          )
        }));
      },
      
      removeToken: (address: string) => {
        set(state => ({
          userTokens: state.userTokens.filter(token => token.address !== address)
        }));
      },
      
      setBotStatus: (status: BotStatusType) => {
        set(state => ({
          botStatus: state.botStatus ? {
            ...state.botStatus,
            status,
            lastActive: status === 'active' ? Date.now() : state.botStatus.lastActive
          } : {
            status,
            lastActive: status === 'active' ? Date.now() : null,
            simulationMode: true,
            autoBoost: false,
            maxTransactionsPerDay: 100,
            transactionsToday: 0,
            requiredSol: 0.5,
            requiredHpepe: 100000
          }
        }));
      },
      
      setSimulationMode: (enabled: boolean) => {
        set(state => ({
          botStatus: state.botStatus ? {
            ...state.botStatus,
            simulationMode: enabled
          } : {
            status: 'inactive',
            lastActive: null,
            simulationMode: enabled,
            autoBoost: false,
            maxTransactionsPerDay: 100,
            transactionsToday: 0,
            requiredSol: 0.5,
            requiredHpepe: 100000
          }
        }));
      },
      
      checkApiStatus: async () => {
        try {
          set({ isLoading: true });
          
          // Simulate API status check
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate random API status for demo
          const endpoints = [
            { name: 'Solana RPC', status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive' },
            { name: 'Solscan API', status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive' },
            { name: 'Jupiter API', status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive' },
            { name: 'Raydium API', status: Math.random() > 0.2 ? 'active' : 'inactive' as 'active' | 'inactive' }
          ];
          
          const working = endpoints.filter(e => e.status === 'active').length;
          const total = endpoints.length;
          
          set({
            apiStatus: {
              working,
              total,
              endpoints,
              lastChecked: Date.now(),
              status: working === total ? 'ok' : working > total / 2 ? 'warning' : 'error'
            },
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to check API status:', error);
          set({
            error: 'Failed to check API status',
            isLoading: false
          });
        }
      },
      
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Simulate initialization delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if we have a stored wallet
          const storedAddress = await AsyncStorage.getItem('walletAddress');
          
          if (storedAddress) {
            // Generate mock wallet data
            const mockWallet = {
              connected: true,
              address: storedAddress,
              balance: {
                sol: Math.random() * 10,
                hpepe: Math.random() * 1000000,
                total: Math.random() * 10
              },
              tokens: [
                {
                  symbol: 'SOL',
                  name: 'Solana',
                  balance: Math.random() * 100,
                  price: 150 + Math.random() * 20,
                  change24h: (Math.random() * 10) - 5
                },
                {
                  symbol: 'HPEPE',
                  name: 'Hellenic Pepe',
                  balance: Math.random() * 1000000,
                  price: 0.00001 + Math.random() * 0.00001,
                  change24h: (Math.random() * 20) - 10
                }
              ]
            };
            
            set({ 
              address: storedAddress,
              initialized: true,
              isSimulated: true, // For demo purposes
              wallet: mockWallet,
              balance: mockWallet.balance.total,
              isLoading: false
            });
            
            // Refresh balance
            get().refreshBalance();
            
            // Check API status
            get().checkApiStatus();
            
            // Fetch token prices
            get().fetchSolanaTokenPrice();
            get().fetchHpepeTokenPrice();
            get().fetchSolanaHistoricalPrices();
          } else {
            set({ 
              initialized: true,
              isSimulated: true, // For demo purposes
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Failed to initialize wallet:', error);
          set({ 
            error: 'Failed to initialize wallet',
            initialized: true,
            isSimulated: true, // For demo purposes
            isLoading: false
          });
        }
      },
      
      connect: async (address: string) => {
        try {
          set({ isConnecting: true, isLoading: true });
          
          // Simulate connection delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Store the address
          await AsyncStorage.setItem('walletAddress', address);
          
          // Generate mock wallet data
          const mockWallet = {
            connected: true,
            address,
            balance: {
              sol: Math.random() * 10,
              hpepe: Math.random() * 1000000,
              total: Math.random() * 10
            },
            tokens: [
              {
                symbol: 'SOL',
                name: 'Solana',
                balance: Math.random() * 100,
                price: 150 + Math.random() * 20,
                change24h: (Math.random() * 10) - 5
              },
              {
                symbol: 'HPEPE',
                name: 'Hellenic Pepe',
                balance: Math.random() * 1000000,
                price: 0.00001 + Math.random() * 0.00001,
                change24h: (Math.random() * 20) - 10
              }
            ]
          };
          
          set({ 
            address,
            isConnecting: false,
            isSimulated: true, // For demo purposes
            wallet: mockWallet,
            balance: mockWallet.balance.total,
            isLoading: false
          });
          
          // Refresh balance
          get().refreshBalance();
          
          // Check API status
          get().checkApiStatus();
          
          // Fetch token prices
          get().fetchSolanaTokenPrice();
          get().fetchHpepeTokenPrice();
          get().fetchSolanaHistoricalPrices();
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({ 
            error: 'Failed to connect wallet',
            isConnecting: false,
            isLoading: false
          });
        }
      },
      
      disconnect: async () => {
        try {
          set({ isLoading: true });
          
          // Remove stored address
          await AsyncStorage.removeItem('walletAddress');
          
          set({ 
            address: null,
            balance: 0,
            wallet: DEFAULT_WALLET,
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to disconnect wallet:', error);
          set({ 
            error: 'Failed to disconnect wallet',
            isLoading: false
          });
        }
      },
      
      refreshBalance: async () => {
        try {
          set({ isLoading: true });
          
          const { address } = get();
          
          if (!address) {
            set({ isLoading: false });
            return;
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a random balance for demo purposes
          const randomBalance = Math.random() * 100;
          
          set({ 
            balance: parseFloat(randomBalance.toFixed(4)),
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to refresh balance:', error);
          set({ 
            error: 'Failed to refresh balance',
            isLoading: false
          });
        }
      },
      
      refreshBalances: async () => {
        try {
          set({ isLoading: true });
          
          const { wallet } = get();
          
          if (!wallet || !wallet.connected) {
            set({ isLoading: false });
            return;
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Update token balances and prices
          const updatedTokens = wallet.tokens.map(token => ({
            ...token,
            balance: token.balance * (0.95 + Math.random() * 0.1), // Small random change
            price: token.symbol === 'HPEPE' ? token.price * (0.98 + Math.random() * 0.04) : token.price, // Small random price change for HPEPE
            change24h: token.symbol === 'HPEPE' ? (Math.random() * 20) - 10 : token.change24h // Random 24h change for HPEPE
          }));
          
          // Update wallet balance
          const newSolBalance = Math.random() * 10;
          const newHpepeBalance = Math.random() * 1000000;
          
          set({ 
            wallet: {
              ...wallet,
              balance: {
                sol: newSolBalance,
                hpepe: newHpepeBalance,
                total: newSolBalance + (newHpepeBalance * 0.00001)
              },
              tokens: updatedTokens
            },
            balance: newSolBalance + (newHpepeBalance * 0.00001),
            isLoading: false
          });
          
          // Also fetch token prices
          get().fetchSolanaTokenPrice();
          get().fetchHpepeTokenPrice();
        } catch (error) {
          console.error('Failed to refresh balances:', error);
          set({ 
            error: 'Failed to refresh balances',
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        address: state.address,
        isSimulated: state.isSimulated,
        botStatus: state.botStatus,
        botSettings: state.botSettings,
        userTokens: state.userTokens
      }),
    }
  )
);