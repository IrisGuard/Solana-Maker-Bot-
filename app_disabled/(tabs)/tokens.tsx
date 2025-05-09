import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, RefreshCw, ExternalLink, Edit2, Check, X, AlertCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import TokenPriceChart from '@/components/TokenPriceChart';
import LoadingOverlay from '@/components/LoadingOverlay';
import AddTokenModal from '@/components/AddTokenModal';
import NotificationBanner from '@/components/NotificationBanner';
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

export default function TokensScreen() {
  const { 
    tokenData = { sol: { price: 0, change: 0 }, hpepe: { price: 0, change: 0, address: '' } }, 
    fetchSolanaTokenPrice, 
    fetchHpepeTokenPrice, 
    fetchSolanaHistoricalPrices,
    chartData = { prices: [], labels: [] },
    isLoading,
    userTokens = [],
    updateTokenPrice,
    removeToken,
    checkApiStatus
  } = useWalletStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: '',
  });
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [apiErrors, setApiErrors] = useState<{[key: string]: string | null}>({
    coinGecko: null,
    solana: null,
    solscan: null
  });
  const [showApiStats, setShowApiStats] = useState(false);
  
  // Use tRPC to get API status from backend
  const apiStatusQuery = trpc.apiStatusRouter.status.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    // Check for API errors
    checkApiErrors();
    
    // Fetch API status from backend
    apiStatusQuery.refetch();
  }, []);

  const checkApiErrors = () => {
    const coinGeckoError = coinGeckoApi.getLastApiError ? coinGeckoApi.getLastApiError() : null;
    const solanaError = solanaApi.getLastApiError ? solanaApi.getLastApiError() : null;
    const solscanError = solscanApi.getLastApiError ? solscanApi.getLastApiError() : null;
    
    setApiErrors({
      coinGecko: coinGeckoError,
      solana: solanaError,
      solscan: solscanError
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (fetchSolanaTokenPrice) await fetchSolanaTokenPrice();
      if (fetchHpepeTokenPrice) await fetchHpepeTokenPrice();
      if (fetchSolanaHistoricalPrices) await fetchSolanaHistoricalPrices();
      if (checkApiStatus) await checkApiStatus();
      await apiStatusQuery.refetch();
      checkApiErrors();
      showNotification('success', 'Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing token data:', error);
      showNotification('error', 'Error refreshing data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddToken = () => {
    setShowAddTokenModal(true);
  };

  const handleTokenAdded = () => {
    setShowAddTokenModal(false);
    onRefresh();
  };

  const openTokenInSolscan = (address: string) => {
    const url = solscanApi.getTokenUrl ? solscanApi.getTokenUrl(address) : `https://solscan.io/token/${address}`;
    
    if (Platform.OS !== 'web') {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open Solscan');
      });
    } else {
      window.open(url, '_blank');
    }
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

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const startEditingToken = (address: string, currentPrice: number) => {
    setEditingToken(address);
    setEditPrice(currentPrice.toString());
  };

  const saveTokenPrice = (address: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    // Find the token
    const token = userTokens.find(t => t.address === address);
    if (token && updateTokenPrice) {
      // Update the token price
      updateTokenPrice(address, price);
      showNotification('success', `${token.symbol} price updated successfully`);
    }
    
    setEditingToken(null);
  };

  const cancelEditing = () => {
    setEditingToken(null);
  };

  const handleRemoveToken = (address: string) => {
    // Don't allow removing HPEPE token
    if (tokenData && tokenData.hpepe && address === tokenData.hpepe.address) {
      Alert.alert('Warning', 'You cannot remove the primary token of the bot');
      return;
    }
    
    Alert.alert(
      'Remove Token',
      'Are you sure you want to remove this token?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (removeToken) {
              removeToken(address);
              showNotification('info', 'Token removed successfully');
            }
          },
        },
      ]
    );
  };

  const handleApiRefresh = async () => {
    try {
      // Reset API states to clear any cached errors
      if (coinGeckoApi.resetApiState) coinGeckoApi.resetApiState();
      if (solanaApi.resetApiState) solanaApi.resetApiState();
      if (solscanApi.resetApiState) solscanApi.resetApiState();
      
      if (checkApiStatus) await checkApiStatus();
      await apiStatusQuery.refetch();
      checkApiErrors();
      showNotification('success', 'API status refreshed');
    } catch (error) {
      showNotification('error', 'Failed to refresh API status');
    }
  };

  const toggleApiStats = () => {
    setShowApiStats(!showApiStats);
  };

  // Check if there are any API errors
  const hasApiErrors = Object.values(apiErrors).some(error => error !== null);

  // Get API key stats
  const coinGeckoStats = coinGeckoApi.getApiKeyStats ? coinGeckoApi.getApiKeyStats() : null;
  const solanaStats = solanaApi.getEndpointStats ? solanaApi.getEndpointStats() : null;
  const solscanStats = solscanApi.getEndpointStats ? solscanApi.getEndpointStats() : null;
  
  // Get backend API status
  const backendApiStatus = apiStatusQuery.data;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Token Prices</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ApiStatusAlert onRefresh={handleApiRefresh} />
        
        {hasApiErrors && (
          <View style={styles.manualPriceAlert}>
            <AlertCircle size={20} color={Colors.dark.warning} />
            <Text style={styles.manualPriceAlertText}>
              API errors detected. You can manually update token prices by clicking the edit icon.
            </Text>
            <TouchableOpacity onPress={toggleApiStats}>
              <Info size={20} color={Colors.dark.warning} />
            </TouchableOpacity>
          </View>
        )}
        
        {showApiStats && (
          <View style={styles.apiStatsContainer}>
            <Text style={styles.apiStatsTitle}>API Connection Details</Text>
            
            {coinGeckoStats && (
              <View style={styles.apiStatSection}>
                <Text style={styles.apiStatSectionTitle}>CoinGecko API</Text>
                <Text style={styles.apiStatText}>Total Keys: {coinGeckoStats.totalKeys}</Text>
                <Text style={styles.apiStatText}>Working Keys: {coinGeckoStats.workingKeys}</Text>
                {coinGeckoStats.currentKey && (
                  <Text style={styles.apiStatText}>Current Key: {coinGeckoStats.currentKey}</Text>
                )}
                {coinGeckoStats.keyFailures && Object.keys(coinGeckoStats.keyFailures).length > 0 && (
                  <View>
                    <Text style={styles.apiStatSubtitle}>Key Failures:</Text>
                    {Object.entries(coinGeckoStats.keyFailures).map(([key, failures], idx) => (
                      <Text key={`failure-${idx}`} style={styles.apiStatText}>
                        {key}: {failures as number} failures
                      </Text>
                    ))}
                  </View>
                )}
                {coinGeckoStats.keySuccesses && Object.keys(coinGeckoStats.keySuccesses).length > 0 && (
                  <View>
                    <Text style={styles.apiStatSubtitle}>Key Successes:</Text>
                    {Object.entries(coinGeckoStats.keySuccesses).map(([key, successes], idx) => (
                      <Text key={`success-${idx}`} style={styles.apiStatText}>
                        {key}: {successes as number} successes
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            {solanaStats && (
              <View style={styles.apiStatSection}>
                <Text style={styles.apiStatSectionTitle}>Solana RPC</Text>
                <Text style={styles.apiStatText}>Total Endpoints: {solanaStats.totalEndpoints}</Text>
                <Text style={styles.apiStatText}>Working Endpoints: {solanaStats.workingEndpoints}</Text>
                {solanaStats.currentEndpoint && (
                  <Text style={styles.apiStatText}>Current Endpoint: {solanaStats.currentEndpoint}</Text>
                )}
              </View>
            )}
            
            {solscanStats && (
              <View style={styles.apiStatSection}>
                <Text style={styles.apiStatSectionTitle}>Solscan API</Text>
                <Text style={styles.apiStatText}>Total Endpoints: {solscanStats.totalEndpoints}</Text>
                <Text style={styles.apiStatText}>Working Endpoints: {solscanStats.workingEndpoints}</Text>
                {solscanStats.currentEndpoint && (
                  <Text style={styles.apiStatText}>Current Endpoint: {solscanStats.currentEndpoint}</Text>
                )}
              </View>
            )}
            
            {/* Backend API Status */}
            {backendApiStatus && backendApiStatus.endpoints && (
              <View style={styles.apiStatSection}>
                <Text style={styles.apiStatSectionTitle}>Backend API Status</Text>
                {backendApiStatus.endpoints.map((endpoint: { name: string, status: string }, index: number) => (
                  <Text key={`backend-${index}`} style={styles.apiStatText}>
                    {endpoint.name}: {endpoint.status}
                  </Text>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.apiStatsCloseButton}
              onPress={toggleApiStats}
            >
              <Text style={styles.apiStatsCloseText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>SOL/USD</Text>
          <Text style={styles.priceText}>
            ${tokenData && tokenData.sol ? tokenData.sol.price.toFixed(2) : '0.00'}
            <Text style={[
              styles.changeText, 
              tokenData && tokenData.sol && tokenData.sol.change >= 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              {' '}{tokenData && tokenData.sol ? (tokenData.sol.change >= 0 ? '+' : '') + tokenData.sol.change.toFixed(2) : '0.00'}%
            </Text>
          </Text>
          <TokenPriceChart 
            data={chartData.prices} 
            labels={chartData.labels}
            color={Colors.dark.accent}
          />
        </View>
        
        <View style={styles.tokensContainer}>
          <View style={styles.tokensHeader}>
            <Text style={styles.tokensTitle}>My Tokens</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddToken}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {userTokens && userTokens.length > 0 ? (
            userTokens.map((token, index) => (
              <View key={index} style={styles.tokenCard}>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenName}>{token.name}</Text>
                </View>
                
                <View style={styles.tokenPrice}>
                  {editingToken === token.address ? (
                    // Editing mode
                    <View style={styles.editPriceContainer}>
                      <TextInput
                        style={styles.editPriceInput}
                        value={editPrice}
                        onChangeText={setEditPrice}
                        keyboardType="decimal-pad"
                        autoFocus
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.saveButton]}
                          onPress={() => saveTokenPrice(token.address)}
                        >
                          <Check size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={cancelEditing}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Display mode
                    <>
                      <Text style={styles.tokenPriceText}>${token.price.toFixed(8)}</Text>
                      <TouchableOpacity 
                        style={styles.tokenLink}
                        onPress={() => startEditingToken(token.address, token.price)}
                      >
                        <Edit2 size={16} color={Colors.dark.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.tokenLink}
                        onPress={() => openTokenInSolscan(token.address)}
                      >
                        <ExternalLink size={16} color={Colors.dark.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.tokenLink}
                        onPress={() => handleRemoveToken(token.address)}
                      >
                        <X size={16} color={Colors.dark.warning} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noTokensContainer}>
              <Text style={styles.noTokensText}>
                You haven't added any tokens yet. Click the "Add" button to add a token.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.marketInfoContainer}>
          <Text style={styles.marketInfoTitle}>Market Information</Text>
          
          <View style={styles.marketInfoRow}>
            <Text style={styles.marketInfoLabel}>Solana Market Cap:</Text>
            <Text style={styles.marketInfoValue}>$12.45B</Text>
          </View>
          
          <View style={styles.marketInfoRow}>
            <Text style={styles.marketInfoLabel}>24h Volume:</Text>
            <Text style={styles.marketInfoValue}>$1.23B</Text>
          </View>
          
          <View style={styles.marketInfoRow}>
            <Text style={styles.marketInfoLabel}>Circulating Supply:</Text>
            <Text style={styles.marketInfoValue}>523.5M SOL</Text>
          </View>
          
          <View style={styles.marketInfoRow}>
            <Text style={styles.marketInfoLabel}>HPEPE Supply:</Text>
            <Text style={styles.marketInfoValue}>1T HPEPE</Text>
          </View>
        </View>
      </ScrollView>
      
      <AddTokenModal 
        visible={showAddTokenModal}
        onClose={() => setShowAddTokenModal(false)}
        onSuccess={handleTokenAdded}
      />
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
  },
  manualPriceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  manualPriceAlertText: {
    color: Colors.dark.text,
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  apiStatsContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  apiStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  apiStatSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  apiStatSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.accent,
    marginBottom: 8,
  },
  apiStatSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.dark.secondaryText,
    marginTop: 4,
    marginBottom: 4,
  },
  apiStatText: {
    fontSize: 13,
    color: Colors.dark.secondaryText,
    marginBottom: 4,
  },
  apiStatsCloseButton: {
    alignItems: 'center',
    padding: 8,
  },
  apiStatsCloseText: {
    color: Colors.dark.accent,
    fontSize: 14,
  },
  chartContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  positiveChange: {
    color: Colors.dark.positive,
  },
  negativeChange: {
    color: Colors.dark.warning,
  },
  tokensContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tokensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokensTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  tokenName: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  tokenPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenPriceText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginRight: 8,
  },
  tokenLink: {
    padding: 4,
    marginLeft: 4,
  },
  noTokensContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTokensText: {
    color: Colors.dark.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  marketInfoContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  marketInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  marketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketInfoLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  marketInfoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  editPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editPriceInput: {
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 4,
    padding: 4,
    color: Colors.dark.text,
    width: 100,
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: Colors.dark.positive,
  },
  cancelButton: {
    backgroundColor: Colors.dark.warning,
  },
});