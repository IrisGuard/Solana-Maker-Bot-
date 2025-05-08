import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { X, Search, AlertCircle, Info, HelpCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import { solscanApi } from '@/services/solscan-api';
import { trpc } from '@/lib/trpc';

interface AddTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTokenModal({ visible, onClose, onSuccess }: AddTokenModalProps) {
  const { addToken } = useWalletStore();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Manual token fields
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  
  // Use tRPC to get API status from backend
  const apiStatusQuery = trpc.api.status.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
    retry: 1,
    retryDelay: 1000,
    staleTime: 300000, // 5 minutes
  });
  
  // Check for API errors when modal opens
  React.useEffect(() => {
    if (visible) {
      // Check API status from backend
      apiStatusQuery.refetch();
      
      const lastError = solscanApi.getLastApiError();
      if (lastError) {
        setApiError(`API Error: ${lastError}. You may need to use manual mode.`);
        // Auto-enable manual mode if there's an API error
        setManualMode(true);
      } else {
        setApiError(null);
      }
    }
  }, [visible]);
  
  const handleAddToken = async () => {
    if (manualMode) {
      // Validate manual inputs
      if (!tokenSymbol.trim()) {
        setError('Token symbol is required');
        return;
      }
      
      if (!tokenName.trim()) {
        setError('Token name is required');
        return;
      }
      
      const price = parseFloat(tokenPrice);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }
      
      if (!tokenAddress.trim()) {
        setError('Token address is required');
        return;
      }
      
      // Add token with manual data
      try {
        addToken({
          address: tokenAddress,
          symbol: tokenSymbol,
          name: tokenName,
          price: price
        });
        
        resetForm();
        onSuccess();
      } catch (error) {
        setError('Failed to add token');
      }
      
      return;
    }
    
    // Auto mode - fetch token data from API
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await solscanApi.addToken(tokenAddress);
      
      if (result.success && result.metadata) {
        const price = result.metadata.priceUsdt 
          ? parseFloat(result.metadata.priceUsdt) 
          : 0.0000001;
        
        addToken({
          address: tokenAddress,
          symbol: result.metadata.symbol || 'UNKNOWN',
          name: result.metadata.name || 'Unknown Token',
          price
        });
        
        resetForm();
        onSuccess();
      } else {
        setError('Failed to get token information. Try manual mode.');
        setManualMode(true);
      }
    } catch (error) {
      console.error('Error adding token:', error);
      setError('Failed to add token. Please try manual mode.');
      setManualMode(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTokenAddress('');
    setTokenSymbol('');
    setTokenName('');
    setTokenPrice('');
    setError(null);
    setManualMode(false);
    setApiError(null);
    setShowHelp(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const toggleManualMode = () => {
    setManualMode(!manualMode);
    setError(null);
  };
  
  const showApiErrorHelp = () => {
    Alert.alert(
      "API Error Information",
      "The token API is currently experiencing issues. Manual mode allows you to add tokens with custom information when automatic data fetching fails.",
      [{ text: "OK" }]
    );
  };
  
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };
  
  // Check if there are API errors from the backend
  const backendApiStatus = apiStatusQuery.data;
  const hasBackendApiErrors = backendApiStatus?.status === 'error' || 
    (backendApiStatus?.endpoints && backendApiStatus.endpoints.some(e => e.status === 'inactive'));
  
  // If we have backend API errors, show them
  React.useEffect(() => {
    if (hasBackendApiErrors && !apiError) {
      setApiError(`API issues detected from backend. Manual mode recommended.`);
      // Auto-enable manual mode if there are backend API errors
      setManualMode(true);
    }
  }, [hasBackendApiErrors, apiStatusQuery.data]);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Token</Text>
            <TouchableOpacity onPress={toggleHelp} style={styles.helpButton}>
              <HelpCircle size={20} color={Colors.dark.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {showHelp && (
              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>How to Add Tokens</Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Auto Mode:</Text> Enter the token's Solana address and we'll try to fetch its information automatically.
                </Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Manual Mode:</Text> If auto mode fails or you want to add a new token not yet in our database, enter all details manually.
                </Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Token Address:</Text> The Solana blockchain address of the token (required in both modes).
                </Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Token Symbol:</Text> Short code for the token (e.g., SOL, BTC).
                </Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Token Name:</Text> Full name of the token (e.g., Solana, Bitcoin).
                </Text>
                <Text style={styles.helpText}>
                  • <Text style={styles.helpBold}>Token Price:</Text> Current price in USD. For new tokens, you may need to estimate this.
                </Text>
              </View>
            )}
            
            {(apiError || hasBackendApiErrors) && (
              <TouchableOpacity 
                style={styles.apiErrorContainer}
                onPress={showApiErrorHelp}
              >
                <AlertCircle size={16} color={Colors.dark.warning} />
                <Text style={styles.apiErrorText}>
                  {apiError || "API issues detected. Manual mode recommended."}
                </Text>
                <Info size={16} color={Colors.dark.warning} />
              </TouchableOpacity>
            )}
            
            <View style={styles.modeToggleContainer}>
              <Text style={styles.modeToggleLabel}>Manual Mode</Text>
              <Switch
                value={manualMode}
                onValueChange={toggleManualMode}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
                thumbColor={manualMode ? Colors.dark.positive : Colors.dark.secondaryText}
              />
            </View>
            
            <Text style={styles.inputLabel}>Token Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter token address"
                placeholderTextColor={Colors.dark.secondaryText}
                value={tokenAddress}
                onChangeText={setTokenAddress}
                autoCapitalize="none"
              />
              {!manualMode && (
                <Search size={20} color={Colors.dark.secondaryText} style={styles.inputIcon} />
              )}
            </View>
            
            {manualMode && (
              <>
                <Text style={styles.inputLabel}>Token Symbol</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. SOL, BTC"
                  placeholderTextColor={Colors.dark.secondaryText}
                  value={tokenSymbol}
                  onChangeText={setTokenSymbol}
                  autoCapitalize="characters"
                />
                
                <Text style={styles.inputLabel}>Token Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Solana, Bitcoin"
                  placeholderTextColor={Colors.dark.secondaryText}
                  value={tokenName}
                  onChangeText={setTokenName}
                />
                
                <Text style={styles.inputLabel}>Token Price (USD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0.0000001"
                  placeholderTextColor={Colors.dark.secondaryText}
                  value={tokenPrice}
                  onChangeText={setTokenPrice}
                  keyboardType="decimal-pad"
                />
              </>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={Colors.dark.warning} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {manualMode 
                  ? "Use manual mode when the token isn't available in public APIs or you want to set a custom price."
                  : "Enter the token's Solana address to automatically fetch its information."}
              </Text>
            </View>
            
            {/* Backend API Status */}
            {backendApiStatus && backendApiStatus.endpoints && (
              <View style={styles.apiStatusContainer}>
                <Text style={styles.apiStatusTitle}>API Status</Text>
                {backendApiStatus.endpoints.map((endpoint, index) => (
                  <View key={`backend-${index}`} style={styles.apiStatusItem}>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                    ]} />
                    <Text style={styles.apiStatusName}>{endpoint.name}</Text>
                    <Text style={[
                      styles.apiStatusText,
                      { color: endpoint.status === 'active' ? Colors.dark.success : Colors.dark.negative }
                    ]}>
                      {endpoint.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.addButton, isLoading && styles.disabledButton]}
              onPress={handleAddToken}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Token</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  helpButton: {
    padding: 4,
    marginRight: 8,
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  helpContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.accent,
    marginBottom: 8,
  },
  helpText: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  helpBold: {
    fontWeight: 'bold',
    color: Colors.dark.accent,
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  apiErrorText: {
    color: Colors.dark.warning,
    marginLeft: 8,
    flex: 1,
    fontSize: 12,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modeToggleLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.dark.warning,
    marginLeft: 8,
    flex: 1,
  },
  infoContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: Colors.dark.accent,
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: Colors.dark.accent,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 16,
  },
  apiStatusContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  apiStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  apiStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  apiStatusName: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    flex: 1,
  },
  apiStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});