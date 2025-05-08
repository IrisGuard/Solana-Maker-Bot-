import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import StatusBadge from './StatusBadge';

type BotControlPanelProps = {
  onStartBot: () => void;
  onStopBot: () => void;
};

export default function BotControlPanel({ onStartBot, onStopBot }: BotControlPanelProps) {
  const { botStatus, wallet } = useWalletStore();
  
  const isActive = botStatus?.status === 'active';
  
  // Safely check if wallet exists and has required properties
  const hasRequiredSol = wallet && wallet.connected && wallet.balance && wallet.balance.sol !== undefined 
    ? wallet.balance.sol >= (botStatus?.requiredSol || 0) 
    : false;
    
  const hasRequiredHpepe = wallet && wallet.connected && wallet.balance && wallet.balance.hpepe !== undefined 
    ? wallet.balance.hpepe >= (botStatus?.requiredHpepe || 0) 
    : false;
    
  const canStart = wallet && wallet.connected && hasRequiredSol && hasRequiredHpepe && !isActive;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Έλεγχος Bot</Text>
        <StatusBadge status={botStatus?.status || 'inactive'} />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Απαιτούμενο SOL</Text>
          <Text style={styles.infoValue}>{botStatus?.requiredSol || 0} SOL</Text>
          {hasRequiredSol ? (
            <CheckCircle2 size={16} color={Colors.dark.positive} />
          ) : (
            <AlertTriangle size={16} color={Colors.dark.warning} />
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Απαιτούμενο HPEPE</Text>
          <Text style={styles.infoValue}>{botStatus?.requiredHpepe || 0} HPEPE</Text>
          {hasRequiredHpepe ? (
            <CheckCircle2 size={16} color={Colors.dark.positive} />
          ) : (
            <AlertTriangle size={16} color={Colors.dark.warning} />
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Διαθέσιμο SOL</Text>
          <Text style={styles.infoValue}>
            {wallet && wallet.connected && wallet.balance && wallet.balance.sol !== undefined 
              ? wallet.balance.sol.toFixed(4) 
              : '0.0000'} SOL
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Διαθέσιμο HPEPE</Text>
          <Text style={styles.infoValue}>
            {wallet && wallet.connected && wallet.balance && wallet.balance.hpepe !== undefined 
              ? wallet.balance.hpepe.toLocaleString() 
              : '0'} HPEPE
          </Text>
        </View>
      </View>
      
      <View style={styles.simulationContainer}>
        <Text style={styles.simulationText}>
          {botStatus?.simulationMode 
            ? 'Λειτουργία Προσομοίωσης: Ενεργή (Δεν θα γίνουν πραγματικές συναλλαγές)'
            : 'Λειτουργία Προσομοίωσης: Ανενεργή (Προσοχή: Θα γίνουν πραγματικές συναλλαγές)'}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        {isActive ? (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]}
            onPress={onStopBot}
          >
            <Pause size={20} color={Colors.dark.text} />
            <Text style={styles.buttonText}>Διακοπή Bot</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.startButton, !canStart && styles.disabledButton]}
            onPress={canStart ? onStartBot : undefined}
            disabled={!canStart}
          >
            <Play size={20} color={Colors.dark.text} />
            <Text style={styles.buttonText}>Εκκίνηση Bot</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {!wallet?.connected && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={16} color={Colors.dark.warning} />
          <Text style={styles.warningText}>
            Συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε το bot
          </Text>
        </View>
      )}
      
      {wallet?.connected && (!hasRequiredSol || !hasRequiredHpepe) && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={16} color={Colors.dark.warning} />
          <Text style={styles.warningText}>
            Ανεπαρκές υπόλοιπο για την εκκίνηση του bot
          </Text>
        </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
    marginRight: 8,
  },
  simulationContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  simulationText: {
    fontSize: 14,
    color: Colors.dark.gold,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
    gap: 8,
  },
  startButton: {
    backgroundColor: Colors.dark.positive,
  },
  stopButton: {
    backgroundColor: Colors.dark.warning,
  },
  disabledButton: {
    backgroundColor: Colors.dark.inactive,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.warningBackground,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.warning,
  },
  warningText: {
    fontSize: 14,
    color: '#FF8A65',
    flex: 1,
  },
});