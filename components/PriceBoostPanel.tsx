import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { TrendingUp, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import * as Haptics from 'expo-haptics';

export default function PriceBoostPanel() {
  const { botSettings, setBotSettings, wallet } = useWalletStore();
  const [boostAmount, setBoostAmount] = useState(botSettings?.manualBoost || '0');
  
  const handleBoost = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(err => {
        console.warn('Haptics error:', err);
      });
    }
    
    // Update the manual boost setting
    if (setBotSettings && botSettings) {
      setBotSettings({ ...botSettings, manualBoost: boostAmount });
    }
    
    // Show a simulated transaction
    setTimeout(() => {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(err => {
          console.warn('Haptics notification error:', err);
        });
      }
    }, 1000);
  };

  // Safely check if wallet exists and has balance
  const walletSolBalance = wallet && wallet.connected && wallet.balance ? wallet.balance.sol : 0;
  const canBoost = wallet && wallet.connected && parseFloat(boostAmount || '0') > 0 && parseFloat(boostAmount || '0') <= walletSolBalance;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ενίσχυση Τιμής</Text>
        <TrendingUp size={20} color={Colors.dark.accent} />
      </View>
      
      <Text style={styles.description}>
        Χρησιμοποιήστε αυτή τη λειτουργία για να ενισχύσετε χειροκίνητα την τιμή του token.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ποσό SOL για ενίσχυση</Text>
        <TextInput
          style={styles.input}
          value={boostAmount}
          onChangeText={setBoostAmount}
          keyboardType="decimal-pad"
          placeholder="0.1"
          placeholderTextColor={Colors.dark.secondaryText}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Διαθέσιμο SOL</Text>
          <Text style={styles.infoValue}>
            {walletSolBalance.toFixed(4)} SOL
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Εκτιμώμενη Αύξηση</Text>
          <Text style={styles.infoValue}>+{(parseFloat(boostAmount || '0') * 5).toFixed(2)}%</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.boostButton,
          !canBoost && styles.disabledButton
        ]}
        onPress={handleBoost}
        disabled={!canBoost}
      >
        <Zap size={20} color={Colors.dark.text} />
        <Text style={styles.boostButtonText}>Ενίσχυση Τώρα</Text>
      </TouchableOpacity>
      
      {!wallet?.connected && (
        <Text style={styles.warningText}>
          Συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε αυτή τη λειτουργία
        </Text>
      )}
      
      {wallet?.connected && parseFloat(boostAmount || '0') > walletSolBalance && (
        <Text style={styles.warningText}>
          Το ποσό ενίσχυσης υπερβαίνει το διαθέσιμο υπόλοιπο SOL
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 4,
    padding: 10,
    color: Colors.dark.text,
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  boostButton: {
    backgroundColor: Colors.dark.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.dark.inactive,
    opacity: 0.7,
  },
  boostButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: Colors.dark.warning,
    textAlign: 'center',
  },
});