# HPEPE Bot - Module Documentation

This document provides detailed information about the modules and components that make up the HPEPE Bot application.

## Core Modules

### 1. Wallet Module

**Purpose**: Manages wallet connections, balances, and transactions.

**Key Components**:
- `WalletConnectModal`: UI for connecting to different wallet providers
- `wallet-store.ts`: Zustand store for wallet state management
- `solana-api.ts`: Service for interacting with Solana blockchain

**Key Functions**:
- `connectWallet()`: Initiates wallet connection
- `disconnectWallet()`: Terminates wallet connection
- `refreshBalances()`: Updates token balances
- `getTransactionHistory()`: Retrieves transaction history

### 2. Bot Control Module

**Purpose**: Manages bot operation, settings, and status.

**Key Components**:
- `BotControlPanel`: UI for starting/stopping the bot
- `BotSettingsPanel`: UI for configuring bot parameters
- `PriceBoostPanel`: UI for boost-specific settings

**Key Functions**:
- `startBot()`: Initiates bot operation
- `stopBot()`: Terminates bot operation
- `updateSettings()`: Modifies bot parameters
- `toggleSimulationMode()`: Switches between real and simulated transactions

### 3. Token Module

**Purpose**: Manages token information, prices, and charts.

**Key Components**:
- `TokenPriceChart`: Displays token price history
- `AddTokenModal`: UI for adding custom tokens
- `coingecko-api.ts`: Service for fetching token prices

**Key Functions**:
- `fetchTokenPrice()`: Retrieves current token price
- `fetchPriceHistory()`: Gets historical price data
- `addCustomToken()`: Adds a token to the user's list
- `refreshTokenData()`: Updates all token information

### 4. Transaction Module

**Purpose**: Handles transaction creation, monitoring, and history.

**Key Components**:
- `TransactionItem`: UI component for displaying transactions
- `TransactionDetailsModal`: Shows detailed transaction information
- `solscan-api.ts`: Service for transaction lookups

**Key Functions**:
- `createTransaction()`: Creates a new transaction
- `simulateTransaction()`: Simulates a transaction without blockchain interaction
- `getTransactionStatus()`: Checks transaction confirmation status
- `viewOnExplorer()`: Opens transaction in Solana explorer

### 5. API Status Module

**Purpose**: Monitors and reports on API connectivity and health.

**Key Components**:
- `ApiStatusAlert`: UI for displaying API status
- `solana-api.ts`: Contains API endpoint testing logic

**Key Functions**:
- `checkApiStatus()`: Tests API endpoints
- `findWorkingEndpoint()`: Locates a responsive RPC node
- `getEndpointHealth()`: Evaluates endpoint performance

### 6. Settings Module

**Purpose**: Manages application settings and user preferences.

**Key Components**:
- `SettingsScreen`: Main settings UI
- `HelpSupportContent`: Help and FAQ content
- `PrivacyPolicy`: Privacy policy text
- `TermsOfService`: Terms of service text

**Key Functions**:
- `clearAllData()`: Resets application data
- `toggleDarkMode()`: Switches between light and dark themes
- `toggleSimulationMode()`: Enables/disables simulation mode

## Support Modules

### 1. Notification Module

**Purpose**: Provides user feedback and alerts.

**Key Components**:
- `NotificationBanner`: Displays temporary notifications
- `ErrorMessage`: Shows error information

**Key Functions**:
- `showNotification()`: Displays a notification
- `hideNotification()`: Removes a notification
- `showError()`: Displays an error message

### 2. Data Persistence Module

**Purpose**: Manages data storage and synchronization.

**Key Components**:
- `supabase.ts`: Supabase client and operations
- `AsyncStorage` integration in stores

**Key Functions**:
- `initializeSupabase()`: Sets up Supabase connection
- `createTables()`: Ensures required tables exist
- `walletOperations`: CRUD operations for wallets
- `transactionOperations`: CRUD operations for transactions
- `tokenOperations`: CRUD operations for tokens

### 3. UI Components Module

**Purpose**: Provides reusable UI elements.

**Key Components**:
- `StatusBadge`: Displays status indicators
- `KeyCard`: Shows wallet key information
- `LoadingOverlay`: Indicates loading state
- `ConfirmationDialog`: Requests user confirmation

## Technical Architecture

### State Management

The application uses Zustand for state management with AsyncStorage persistence:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Navigation

The application uses Expo Router for navigation:

```javascript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="tokens" options={{ title: "Tokens" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      <Tabs.Screen name="bot-control" options={{ title: "Bot Control" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

### API Integration

The application uses a service-based approach for API integration:

```javascript
// services/solana-api.ts
export class SolanaApi {
  private currentEndpoint: string | null = null;
  private simulationMode = true;

  async initialize(): Promise<boolean> {
    // Implementation
  }

  async getBalances(address: string): Promise<{ sol: number; hpepe: number }> {
    // Implementation
  }

  // Other methods
}

export const solanaApi = new SolanaApi();
```

### Error Handling

The application implements a centralized error handling approach:

```javascript
// Error handling in API calls
try {
  const result = await apiCall();
  // Process result
} catch (error) {
  // Extract error message
  const errorMessage = getErrorMessage(error);
  
  // Update error state
  set({ error: errorMessage });
  
  // Log error for debugging
  console.error('API call failed:', errorMessage);
  
  // Return fallback or throw
  return fallbackValue;
}
```

## Module Interactions

1. **Wallet → Token**: Wallet connection triggers token balance fetching
2. **Bot Control → Transaction**: Bot operation creates transactions
3. **API Status → Bot Control**: API status affects simulation mode
4. **Settings → All Modules**: Settings changes impact all modules
5. **Transaction → Wallet**: Transactions update wallet balances

## Conclusion

The HPEPE Bot application is built on a modular architecture that separates concerns while allowing for efficient interaction between components. This design promotes maintainability, testability, and extensibility.