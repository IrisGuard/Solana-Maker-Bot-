import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import * as Haptics from 'expo-haptics';

type WalletConnectModalProps = {
  visible: boolean;
  onClose: () => void;
};

const wallets = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://phantom.app/img/logo.png',
    description: 'Η πιο δημοφιλής επιλογή για χρήστες Solana',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'https://solflare.com/logo.png',
    description: 'Ασφαλές και εύχρηστο πορτοφόλι για το Solana',
  },
  {
    id: 'slope',
    name: 'Slope',
    icon: 'https://slope.finance/assets/images/logo.png',
    description: 'Πορτοφόλι με έμφαση στην κινητή εμπειρία',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: 'https://backpack.app/assets/backpack-logo.png',
    description: 'Νέο πορτοφόλι με πολλές δυνατότητες',
  },
];

export default function WalletConnectModal({ visible, onClose }: WalletConnectModalProps) {
  const { connectWallet, isLoading } = useWalletStore();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setError(null);
    
    try {
      await connectWallet(walletId);
      onClose();
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Αποτυχία σύνδεσης πορτοφολιού';
      
      // Ειδικός χειρισμός για το σφάλμα απόρριψης από τον χρήστη
      if (errorMessage.includes('User rejected') || errorMessage.includes('rejected the request')) {
        setError('Η σύνδεση ακυρώθηκε από τον χρήστη. Δοκιμάστε ξανά.');
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Σύνδεση Πορτοφολιού</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <Text style={styles.subtitle}>Επιλέξτε ένα πορτοφόλι για σύνδεση</Text>
          
          <ScrollView style={styles.walletList}>
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={styles.walletItem}
                onPress={() => handleConnect(wallet.id)}
                disabled={isLoading}
              >
                <View style={styles.walletIconContainer}>
                  <Text style={styles.walletIconFallback}>{wallet.name.charAt(0)}</Text>
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Text style={styles.walletDescription}>{wallet.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.disclaimer}>
            Συνδέοντας το πορτοφόλι σας, αποδέχεστε τους όρους χρήσης της εφαρμογής.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
    marginBottom: 16,
  },
  walletList: {
    marginBottom: 16,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIconFallback: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletInfo: {
    marginLeft: 16,
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.dark.warningBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.warning,
  },
  errorText: {
    color: '#FF8A65',
    fontSize: 14,
  },
});