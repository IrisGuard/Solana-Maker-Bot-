import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertCircle, CheckCircle, RefreshCw, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
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

interface ApiStatusAlertProps {
  onRefresh?: () => void;
}

interface ApiEndpoint {
  name: string;
  status: 'active' | 'inactive';
}

interface ApiKeyDetail {
  keyId: string;
  status: 'active' | 'inactive';
  failures?: number;
}

interface ApiKeyService {
  service: string;
  workingKeys: number;
  totalKeys: number;
  keyDetails: ApiKeyDetail[];
}

export default function ApiStatusAlert({ onRefresh }: ApiStatusAlertProps) {
  const { apiStatus, checkApiStatus } = useWalletStore();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [coinGeckoStatus, setCoinGeckoStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
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
  
  // Use tRPC to get API key status from backend
  const apiKeyStatusQuery = trpc.apiStatusRouter.keyStatus.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000, // 5 minutes
  });
  
  useEffect(() => {
    // Check API status on component mount if it hasn't been checked in the last hour
    const lastCheckedTime = apiStatus?.lastChecked || 0;
    const oneHourAgo = Date.now() - 3600000;
    
    if (lastCheckedTime < oneHourAgo && checkApiStatus) {
      console.log("API status check needed, last checked:", new Date(lastCheckedTime).toLocaleString());
      checkApiStatus();
    }
    
    // Check CoinGecko API status
    checkCoinGeckoStatus();
    
    // Check for API errors
    checkApiErrors();
    
    // Fetch API status from backend
    apiStatusQuery.refetch();
    apiKeyStatusQuery.refetch();
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
    
    // If there are errors, expand the panel
    if (coinGeckoError || solanaError || solscanError) {
      setExpanded(true);
    }
  };
  
  const checkCoinGeckoStatus = async () => {
    setCoinGeckoStatus('checking');
    try {
      if (coinGeckoApi.checkApiStatus) {
        const isWorking = await coinGeckoApi.checkApiStatus();
        setCoinGeckoStatus(isWorking ? 'active' : 'inactive');
      } else {
        setCoinGeckoStatus('inactive');
      }
    } catch (error) {
      console.error('Error checking CoinGecko status:', error);
      setCoinGeckoStatus('inactive');
    }
  };
  
  const handleRefresh = async () => {
    console.log("Manually refreshing API status");
    setIsRefreshing(true);
    
    try {
      // Reset API states to clear any cached errors
      if (coinGeckoApi.resetApiState) coinGeckoApi.resetApiState();
      if (solanaApi.resetApiState) solanaApi.resetApiState();
      if (solscanApi.resetApiState) solscanApi.resetApiState();
      
      // Check CoinGecko status
      await checkCoinGeckoStatus();
      
      // Refresh API status from backend
      await Promise.all([
        apiStatusQuery.refetch(),
        apiKeyStatusQuery.refetch()
      ]);
      
      // Check other APIs
      if (onRefresh) {
        await onRefresh();
      } else if (checkApiStatus) {
        await checkApiStatus();
      }
      
      // Check for API errors again
      checkApiErrors();
    } catch (error) {
      console.error('Error refreshing API status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // If apiStatus is not available, show a loading state
  if (!apiStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={20} color={Colors.dark.warning} />
          <Text style={styles.title}>API Status</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : (
              <RefreshCw size={18} color={Colors.dark.accent} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.loadingText}>Loading API status...</Text>
      </View>
    );
  }
  
  const { working, total, endpoints, lastChecked } = apiStatus;
  const statusPercentage = total > 0 ? Math.round((working / total) * 100) : 0;
  
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return Colors.dark.success;
    if (percentage >= 50) return Colors.dark.warning;
    return Colors.dark.negative; // Changed from error to negative
  };
  
  const statusColor = getStatusColor(statusPercentage);
  
  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    
    const date = new Date(lastChecked);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Add CoinGecko status to the endpoints list
  const allEndpoints = [
    ...endpoints,
    { 
      name: 'CoinGecko API', 
      status: coinGeckoStatus === 'checking' ? 'inactive' : coinGeckoStatus 
    }
  ];
  
  // Recalculate working count including CoinGecko
  const totalWithCoinGecko = total + 1;
  const workingWithCoinGecko = working + (coinGeckoStatus === 'active' ? 1 : 0);
  const statusPercentageWithCoinGecko = totalWithCoinGecko > 0 
    ? Math.round((workingWithCoinGecko / totalWithCoinGecko) * 100) 
    : 0;
  
  const statusColorWithCoinGecko = getStatusColor(statusPercentageWithCoinGecko);
  
  // Check if there are any API errors
  const hasApiErrors = Object.values(apiErrors).some(error => error !== null);
  
  // Get API key stats
  const coinGeckoStats = coinGeckoApi.getApiKeyStats ? coinGeckoApi.getApiKeyStats() : null;
  const solanaStats = solanaApi.getEndpointStats ? solanaApi.getEndpointStats() : null;
  const solscanStats = solscanApi.getEndpointStats ? solscanApi.getEndpointStats() : null;
  
  // Get backend API status
  const backendApiStatus = apiStatusQuery.data;
  const backendApiKeyStatus = apiKeyStatusQuery.data;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        {statusPercentageWithCoinGecko >= 80 ? (
          <CheckCircle size={20} color={Colors.dark.success} />
        ) : statusPercentageWithCoinGecko >= 50 ? (
          <AlertTriangle size={20} color={Colors.dark.warning} />
        ) : (
          <AlertCircle size={20} color={statusColorWithCoinGecko} />
        )}
        <Text style={styles.title}>API Status</Text>
        <View style={styles.headerRight}>
          {expanded ? (
            <ChevronUp size={18} color={Colors.dark.secondaryText} style={styles.expandIcon} />
          ) : (
            <ChevronDown size={18} color={Colors.dark.secondaryText} style={styles.expandIcon} />
          )}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : (
              <RefreshCw size={18} color={Colors.dark.accent} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <View style={styles.statusSummary}>
        <Text style={styles.statusText}>
          {workingWithCoinGecko} of {totalWithCoinGecko} endpoints active ({statusPercentageWithCoinGecko}%)
        </Text>
        <Text style={styles.lastCheckedText}>
          Last checked: {formatLastChecked()}
        </Text>
      </View>
      
      {hasApiErrors && (
        <View style={styles.apiErrorsContainer}>
          <Text style={styles.apiErrorsTitle}>API Errors Detected:</Text>
          {Object.entries(apiErrors).map(([api, error]) => 
            error && (
              <Text key={api} style={styles.apiErrorItem}>
                • {api}: {error.substring(0, 100)}{error.length > 100 ? '...' : ''}
              </Text>
            )
          )}
          <Text style={styles.apiErrorsHelp}>
            Try refreshing or using manual token price entry if issues persist.
          </Text>
        </View>
      )}
      
      {expanded && (
        <>
          {allEndpoints && allEndpoints.length > 0 && (
            <View style={styles.endpointsList}>
              {allEndpoints.map((endpoint: ApiEndpoint, index: number) => (
                <View key={index} style={styles.endpointItem}>
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                  ]} />
                  <Text style={styles.endpointName}>{endpoint.name}</Text>
                  <Text style={[
                    styles.endpointStatus,
                    { color: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                  ]}>
                    {endpoint.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Backend API Status */}
          {backendApiStatus && backendApiStatus.endpoints && (
            <View style={styles.backendStatusContainer}>
              <Text style={styles.backendStatusTitle}>Backend API Status</Text>
              {backendApiStatus.endpoints.map((endpoint: ApiEndpoint, index: number) => (
                <View key={`backend-${index}`} style={styles.endpointItem}>
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                  ]} />
                  <Text style={styles.endpointName}>{endpoint.name}</Text>
                  <Text style={[
                    styles.endpointStatus,
                    { color: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                  ]}>
                    {endpoint.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* API Key Status */}
          {backendApiKeyStatus && backendApiKeyStatus.services && (
            <View style={styles.apiKeyStatusContainer}>
              <Text style={styles.apiKeyStatusTitle}>API Key Status</Text>
              {Object.entries(backendApiKeyStatus.services).map(([serviceName, serviceData]: [string, any], index: number) => (
                <View key={`service-${index}`} style={styles.apiKeyServiceItem}>
                  <Text style={styles.apiKeyServiceName}>
                    {serviceName}: {serviceData.workingKeys}/{serviceData.totalKeys} keys working
                  </Text>
                  {serviceData.keyDetails && serviceData.keyDetails.length > 0 && (
                    <View style={styles.apiKeyDetailsList}>
                      {serviceData.keyDetails.map((key: ApiKeyDetail, keyIndex: number) => (
                        <View key={`key-${keyIndex}`} style={styles.apiKeyDetailItem}>
                          <View style={[
                            styles.statusIndicator, 
                            { backgroundColor: key.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                          ]} />
                          <Text style={styles.apiKeyDetailText}>
                            {key.keyId} - {key.status}
                            {key.status === 'inactive' && key.failures !== undefined && ` (${key.failures} failures)`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {(coinGeckoStats || solanaStats || solscanStats) && (
            <View style={styles.apiStatsContainer}>
              <Text style={styles.apiStatsTitle}>API Connection Details</Text>
              
              {coinGeckoStats && coinGeckoStats.totalKeys > 0 && (
                <View style={styles.apiStatSection}>
                  <Text style={styles.apiStatSectionTitle}>CoinGecko API</Text>
                  <Text style={styles.apiStatText}>Total Keys: {coinGeckoStats.totalKeys}</Text>
                  <Text style={styles.apiStatText}>Working Keys: {coinGeckoStats.workingKeys}</Text>
                  {coinGeckoStats.currentKey && (
                    <Text style={styles.apiStatText}>Current Key: {coinGeckoStats.currentKey}</Text>
                  )}
                  
                  {/* Show key failures */}
                  {coinGeckoStats.keyFailures && Object.keys(coinGeckoStats.keyFailures).length > 0 && (
                    <View style={styles.apiKeyDetailsList}>
                      <Text style={styles.apiStatSubtitle}>Key Failures:</Text>
                      {Object.entries(coinGeckoStats.keyFailures).map(([key, failures], idx) => (
                        <Text key={`failure-${idx}`} style={styles.apiStatText}>
                          {key}: {failures as number} failures
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {/* Show key successes */}
                  {coinGeckoStats.keySuccesses && Object.keys(coinGeckoStats.keySuccesses).length > 0 && (
                    <View style={styles.apiKeyDetailsList}>
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
              
              {solanaStats && solanaStats.totalEndpoints > 0 && (
                <View style={styles.apiStatSection}>
                  <Text style={styles.apiStatSectionTitle}>Solana RPC</Text>
                  <Text style={styles.apiStatText}>Total Endpoints: {solanaStats.totalEndpoints}</Text>
                  <Text style={styles.apiStatText}>Working Endpoints: {solanaStats.workingEndpoints}</Text>
                  {solanaStats.currentEndpoint && (
                    <Text style={styles.apiStatText}>Current Endpoint: {solanaStats.currentEndpoint}</Text>
                  )}
                </View>
              )}
              
              {solscanStats && solscanStats.totalEndpoints > 0 && (
                <View style={styles.apiStatSection}>
                  <Text style={styles.apiStatSectionTitle}>Solscan API</Text>
                  <Text style={styles.apiStatText}>Total Endpoints: {solscanStats.totalEndpoints}</Text>
                  <Text style={styles.apiStatText}>Working Endpoints: {solscanStats.workingEndpoints}</Text>
                  {solscanStats.currentEndpoint && (
                    <Text style={styles.apiStatText}>Current Endpoint: {solscanStats.currentEndpoint}</Text>
                  )}
                </View>
              )}
            </View>
          )}
        </>
      )}
      
      {hasApiErrors && !expanded && (
        <TouchableOpacity 
          style={styles.showMoreButton}
          onPress={() => setExpanded(true)}
        >
          <Text style={styles.showMoreText}>Show Details</Text>
          <Info size={14} color={Colors.dark.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginRight: 8,
  },
  refreshButton: {
    padding: 4,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Fixed value instead of conditional
  },
  statusText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  lastCheckedText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
  apiErrorsContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  apiErrorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.warning,
    marginBottom: 8,
  },
  apiErrorItem: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginBottom: 4,
  },
  apiErrorsHelp: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.dark.accent,
    marginTop: 8,
  },
  endpointsList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 8,
  },
  endpointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  endpointName: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  endpointStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    fontStyle: 'italic',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginRight: 4,
  },
  apiStatsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  apiStatsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  apiStatSection: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  apiStatSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.dark.accent,
    marginBottom: 4,
  },
  apiStatSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.secondaryText,
    marginTop: 4,
    marginBottom: 2,
  },
  apiStatText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginBottom: 2,
  },
  backendStatusContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  backendStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  apiKeyStatusContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  apiKeyStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  apiKeyServiceItem: {
    marginBottom: 8,
  },
  apiKeyServiceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.dark.accent,
    marginBottom: 4,
  },
  apiKeyDetailsList: {
    marginLeft: 8,
  },
  apiKeyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  apiKeyDetailText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
});