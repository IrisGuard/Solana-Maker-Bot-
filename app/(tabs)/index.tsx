import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWalletStore } from '@/store/wallet-store';
import Colors from '@/constants/colors';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import WalletTokens from '@/components/WalletTokens';

export default function WalletScreen() {
  const router = useRouter();
  const { address, balance, refreshBalance, isSimulated, wallet, initialize, error, isLoading } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(true); // Set to true by default for now
  const [initialized, setInitialized] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const { publicKey, connected } = useWallet();

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  useEffect(() => {
    const checkOnboarded = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
        setHasOnboarded(onboardingComplete === 'true');
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // Default to true if there's an error
        setHasOnboarded(true);
      }
    };

    const initializeApp = async () => {
      try {
        setLoadingText('Initializing application...');
        await initialize();
        setInitialized(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setInitializationError(err instanceof Error ? err.message : 'Initialization error');
      }
    };

    checkOnboarded();
    initializeApp();
  }, []);

  useEffect(() => {
    if (initialized) {
      refreshBalance();
    }
  }, [initialized]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  const copyAddress = async () => {
    if (!address) return;
    
    await Clipboard.setStringAsync(address);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectWallet = () => {
    router.push('/modal');
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const openExplorer = () => {
    if (!address) return;
    
    const explorerUrl = `https://explorer.solana.com/address/${address}`;
    if (Platform.OS === 'web') {
      window.open(explorerUrl, '_blank');
    } else {
      // Handle for mobile if needed
    }
  };

  if (initializationError) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <View style={styles.container}>
            <StatusBar style="light" />
            {Platform.OS === 'web' && (
              <View style={{ marginBottom: 20 }}>
              </View>
            )}
            <Text style={styles.appName}>Solana Maker Bot</Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Initialization Error</Text>
              <Text style={styles.errorText}>{initializationError}</Text>
              <Text style={styles.errorHint}>
                The application will continue in simulation mode. Some features may be limited.
              </Text>
            </View>
            <Text style={styles.loadingText}>Continuing in simulation mode...</Text>
          </View>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

  if (hasOnboarded === false) {
    return <Redirect href="/onboarding" />;
  }

  if (!initialized) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.appName}>Solana Maker Bot</Text>
            <ActivityIndicator size="large" color={Colors.dark.accent} style={styles.loader} />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <View style={styles.container}>
          <StatusBar style="light" />
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.dark.accent]}
                tintColor={Colors.dark.accent}
              />
            }
          >
            <View style={styles.header}>
              <Text style={styles.title}>Solana Maker Bot</Text>
              {isSimulated && (
                <View style={styles.simulatedBadge}>
                  <Text style={styles.simulatedText}>Simulation Mode</Text>
                </View>
              )}
            </View>

            {address ? (
              <View style={styles.walletCard}>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>SOL Balance</Text>
                  <Text style={styles.balanceValue}>{wallet?.balance?.sol.toFixed(4) || "0.0000"}</Text>
                  <Text style={styles.fiatValue}>≈ ${(wallet?.balance?.sol * 150).toFixed(2) || "0.00"} USD</Text>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Wallet Address</Text>
                  <View style={styles.addressRow}>
                    <Text style={styles.addressValue}>{formatAddress(address)}</Text>
                    <TouchableOpacity onPress={copyAddress} style={styles.copyButton}>
                      <Copy size={20} color={Colors.dark.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openExplorer} style={styles.explorerButton}>
                      <ExternalLink size={20} color={Colors.dark.text} />
                    </TouchableOpacity>
                  </View>
                  {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                    <RefreshCw size={16} color={Colors.dark.text} />
                    <Text style={styles.refreshText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.connectContainer}>
                <Text style={styles.connectText}>
                  Connect your wallet to monitor your balance and transactions.
                </Text>
                <TouchableOpacity style={styles.connectButton} onPress={connectWallet}>
                  <Text style={styles.connectButtonText}>Connect Wallet</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Solana Maker Bot</Text>
              <Text style={styles.infoText}>
                Create and manage automated trading bots on the Solana blockchain. Monitor your portfolio, track transactions, and optimize your trading strategies.
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  simulatedBadge: {
    backgroundColor: Colors.dark.warningBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  simulatedText: {
    color: Colors.dark.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  walletCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 5,
  },
  fiatValue: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressValue: {
    fontSize: 16,
    color: Colors.dark.text,
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  explorerButton: {
    padding: 8,
  },
  copiedText: {
    fontSize: 12,
    color: Colors.dark.success,
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  refreshText: {
    color: Colors.dark.text,
    marginLeft: 5,
    fontSize: 14,
  },
  connectContainer: {
    alignItems: 'center',
    padding: 20,
  },
  connectText: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    lineHeight: 22,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
    textAlign: 'center', 
    marginTop: 20
  },
  errorContainer: {
    backgroundColor: Colors.dark.warningBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.warning,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.warning,
  },
  errorHint: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  loader: {
    marginBottom: 20,
  },
});