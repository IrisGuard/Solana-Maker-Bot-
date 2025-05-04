import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import BotControlPanel from '@/components/BotControlPanel';
import BotSettingsPanel from '@/components/BotSettingsPanel';
import PriceBoostPanel from '@/components/PriceBoostPanel';
import NotificationBanner from '@/components/NotificationBanner';
import LoadingOverlay from '@/components/LoadingOverlay';
import ErrorMessage from '@/components/ErrorMessage';
import ApiStatusAlert from '@/components/ApiStatusAlert';
import { trpc } from '@/lib/trpc';

// Import API services if they exist
let coinGeckoApi: any = {};
let solanaApi: any = {};
let solscanApi: any = {};

try {
  coinGeckoApi = require('@/services/coingecko-api').coinGeckoApi;
} catch (error) {
  console.warn('CoinGecko API not available:', error);
}

try {
  solanaApi = require('@/services/solana-api').solanaApi;
} catch (error) {
  console.warn('Solana API not available:', error);
}

try {
  solscanApi = require('@/services/solscan-api').solscanApi;
} catch (error) {
  console.warn('Solscan API not available:', error);
}

export default function BotControlScreen() {
  const { 
    botStatus, 
    setBotStatus, 
    refreshBalances, 
    isLoading, 
    error, 
    checkApiStatus,
    apiStatus,
    wallet,
    setSimulationMode
  } = useWalletStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: '',
  });
  const [apiErrors, setApiErrors] = useState<{[key: string]: string | null}>({
    coinGecko: null,
    solana: null,
    solscan: null
  });
  
  // Use tRPC to get API status from backend
  const apiStatusQuery = trpc.apiStatusRouter.status.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    // Check API status on component mount
    if (checkApiStatus) {
      checkApiStatus();
    }
    
    // Check for API errors
    checkApiErrors();
    
    // Fetch API status from backend
    apiStatusQuery.refetch();
    
    // Set up interval to check API status every 5 minutes
    const interval = setInterval(() => {
      if (checkApiStatus) {
        checkApiStatus();
      }
      checkApiErrors();
      apiStatusQuery.refetch();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [checkApiStatus]);

  const checkApiErrors = () => {
    const coinGeckoError = coinGeckoApi.getLastApiError ? coinGeckoApi.getLastApiError() : null;
    const solanaError = solanaApi.getLastApiError ? solanaApi.getLastApiError() : null;
    const solscanError = solscanApi.getLastApiError ? solscanApi.getLastApiError() : null;
    
    setApiErrors({
      coinGecko: coinGeckoError,
      solana: solanaError,
      solscan: solscanError
    });
    
    // If there are serious API errors, suggest simulation mode
    if ((coinGeckoError || solanaError) && botStatus && !botStatus.simulationMode && setSimulationMode) {
      Alert.alert(
        "API Connection Issues",
        "We're experiencing issues connecting to some APIs. Would you like to enable simulation mode to prevent potential errors?",
        [
          {
            text: "No, continue with real mode",
            style: "cancel"
          },
          {
            text: "Yes, enable simulation mode",
            onPress: () => {
              setSimulationMode(true);
              showNotification('info', 'Simulation mode enabled due to API issues');
            }
          }
        ]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (refreshBalances) {
        await refreshBalances();
      }
      if (checkApiStatus) {
        await checkApiStatus();
      }
      await apiStatusQuery.refetch();
      checkApiErrors();
      showNotification('success', 'Data refreshed successfully!');
    } catch (error: any) {
      setErrorMessage('Error refreshing data.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartBot = () => {
    if (!wallet || !wallet.connected) {
      showNotification('error', 'Connect your wallet to start the bot');
      return;
    }
    
    // Check for API errors before starting
    const hasApiErrors = Object.values(apiErrors).some(error => error !== null);
    if (hasApiErrors && botStatus && !botStatus.simulationMode && setSimulationMode) {
      Alert.alert(
        "API Connection Issues",
        "We're experiencing issues connecting to some APIs. It's recommended to enable simulation mode before starting the bot.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Enable simulation mode",
            onPress: () => {
              setSimulationMode(true);
              if (setBotStatus) {
                setBotStatus('active');
              }
              showNotification('success', 'Bot started in simulation mode');
            }
          },
          {
            text: "Start anyway",
            style: "destructive",
            onPress: () => {
              if (setBotStatus) {
                setBotStatus('active');
              }
              showNotification('success', 'Bot started (with potential API issues)');
            }
          }
        ]
      );
      return;
    }
    
    if (setBotStatus) {
      setBotStatus('active');
    }
    showNotification('success', 'Bot started successfully!');
  };

  const handleStopBot = () => {
    if (setBotStatus) {
      setBotStatus('inactive');
    }
    showNotification('info', 'Bot stopped');
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({
      visible: true,
      type,
      message,
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const handleApiRefresh = async () => {
    try {
      // Reset API states to clear any cached errors
      if (coinGeckoApi.resetApiState) coinGeckoApi.resetApiState();
      if (solanaApi.resetApiState) solanaApi.resetApiState();
      if (solscanApi.resetApiState) solscanApi.resetApiState();
      
      // Check API status
      if (checkApiStatus) {
        await checkApiStatus();
      }
      await apiStatusQuery.refetch();
      checkApiErrors();
      showNotification('success', 'API status refreshed');
    } catch (error) {
      showNotification('error', 'Failed to refresh API status');
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // Check if there are any API errors
  const hasApiErrors = Object.values(apiErrors).some(error => error !== null);
  
  // Check if there are backend API errors
  const backendApiStatus = apiStatusQuery.data;
  const hasBackendApiErrors = backendApiStatus?.status === 'error' || 
    (backendApiStatus?.endpoints && backendApiStatus.endpoints.some((e: any) => e.status === 'inactive'));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {errorMessage && (
          <ErrorMessage 
            message={errorMessage} 
            onDismiss={() => setErrorMessage(null)} 
          />
        )}
        
        <ApiStatusAlert onRefresh={handleApiRefresh} />
        
        <View style={styles.section}>
          <BotControlPanel 
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
          />
        </View>
        
        <View style={styles.section}>
          <BotSettingsPanel />
        </View>
        
        <View style={styles.section}>
          <PriceBoostPanel />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Bot Information</Text>
          <Text style={styles.infoText}>
            The Solana Maker Bot uses advanced algorithms to increase token price through strategic transactions on the Solana blockchain.
          </Text>
          <Text style={styles.infoText}>
            For best results, it is recommended to have at least 0.5 SOL and 100,000 tokens in your wallet.
          </Text>
          <Text style={styles.infoText}>
            The bot operates in simulation mode by default and does not perform real transactions unless you disable simulation mode in settings.
          </Text>
          
          {(hasApiErrors || hasBackendApiErrors) && (
            <Text style={styles.apiErrorNote}>
              Note: API connection issues detected. The bot will use cached or estimated values where needed. You can manually set token prices in the Tokens tab.
            </Text>
          )}
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading && !refreshing} message="Loading data..." />
      
      <NotificationBanner
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        onDismiss={hideNotification}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 8,
    lineHeight: 20,
  },
  apiErrorNote: {
    fontSize: 14,
    color: Colors.dark.warning,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});