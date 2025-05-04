import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useWalletStore } from '@/store/wallet-store';
import Colors from '@/constants/colors';
import { X, Wallet, ArrowRight } from 'lucide-react-native';

export default function WalletConnectModal() {
  const router = useRouter();
  const { connect, isConnecting } = useWalletStore();
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    // Simple validation for Solana address (should be 44 characters)
    if (walletAddress.length !== 44) {
      setError('Invalid Solana wallet address');
      return;
    }
    
    try {
      await connect(walletAddress);
      router.back();
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  const handleDemoWallet = async () => {
    // Generate a fake Solana address for demo purposes
    const demoAddress = 'DemoWa11etAddre55Rork1234567890xxxxxxxxxxxxx';
    setWalletAddress(demoAddress);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Connect Wallet</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.walletIcon}>
          <Wallet size={40} color={Colors.dark.accent} />
        </View>
        
        <Text style={styles.subtitle}>Enter your Solana wallet address</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Solana Wallet Address"
          placeholderTextColor={Colors.dark.secondaryText}
          value={walletAddress}
          onChangeText={(text) => {
            setWalletAddress(text);
            setError('');
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.connectButton, isConnecting && styles.connectingButton]}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          <Text style={styles.connectButtonText}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Text>
          {!isConnecting && <ArrowRight size={20} color="#fff" />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.demoButton} onPress={handleDemoWallet}>
          <Text style={styles.demoButtonText}>Use Demo Wallet</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  walletIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 15,
    color: Colors.dark.text,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  errorText: {
    color: Colors.dark.error,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  connectButton: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  connectingButton: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  demoButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  demoButtonText: {
    color: Colors.dark.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  footerText: {
    color: Colors.dark.secondaryText,
    fontSize: 12,
    textAlign: 'center',
  },
});