import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';
import text from '@/constants/text';
import { solscanApi } from '@/services/solscan-api';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
  amount: number;
  currency: string;
  tokens: number;
  tokenCurrency: string;
  address: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  signature?: string;
  maker?: string;
}

type TransactionItemProps = {
  transaction: Transaction;
};

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const { type, amount, currency, tokens, tokenCurrency, address, timestamp, signature, status, maker } = transaction;
  const isPurchase = type === 'purchase';
  const timeAgo = formatTimeAgo(timestamp);
  
  const handleViewOnSolscan = () => {
    if (!signature) {
      Alert.alert('Πληροφορία', 'Αυτή είναι μια προσομοιωμένη συναλλαγή χωρίς υπογραφή blockchain.');
      return;
    }
    
    const url = solscanApi.getTransactionUrl(signature);
    
    if (Platform.OS !== 'web') {
      Linking.openURL(url).catch(err => {
        Alert.alert('Σφάλμα', 'Δεν ήταν δυνατό το άνοιγμα του Solscan');
      });
    } else {
      // For web, open in new tab
      window.open(url, '_blank');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.leftBorder, 
        { backgroundColor: isPurchase ? Colors.dark.accent : Colors.dark.warning }
      ]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {isPurchase ? (
              <ArrowDownRight size={18} color={Colors.dark.accent} />
            ) : (
              <ArrowUpRight size={18} color={Colors.dark.warning} />
            )}
            <Text style={[
              styles.typeText, 
              {color: isPurchase ? Colors.dark.accent : Colors.dark.warning}
            ]}>
              {isPurchase ? text.purchase : text.sale}
            </Text>
            
            {status === 'pending' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Εκκρεμεί</Text>
              </View>
            )}
            
            {status === 'failed' && (
              <View style={[styles.statusBadge, styles.failedBadge]}>
                <Text style={styles.statusText}>Απέτυχε</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.timestamp}>{timeAgo}</Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>{text.amount}</Text>
            <Text style={styles.detailValue}>
              {amount.toFixed(6)} {currency}
            </Text>
            <Text style={styles.detailLabel}>{text.address}:</Text>
            <Text style={styles.detailValue}>{address}</Text>
          </View>
          
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Tokens</Text>
            <Text style={styles.detailValue}>
              {tokens.toLocaleString()} {tokenCurrency}
            </Text>
            <TouchableOpacity style={styles.viewButton} onPress={handleViewOnSolscan}>
              <Text style={styles.viewButtonText}>{text.viewTransactionOnSolscan}</Text>
              <ExternalLink size={14} color={Colors.dark.accent} />
            </TouchableOpacity>
          </View>
        </View>
        
        {maker && (
          <View style={styles.makerContainer}>
            <Text style={styles.makerLabel}>Maker:</Text>
            <Text style={styles.makerText}>{maker}</Text>
          </View>
        )}
        
        {signature && (
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>Signature:</Text>
            <Text style={styles.signatureText}>
              {signature.substring(0, 8)}...{signature.substring(signature.length - 8)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    overflow: 'hidden',
  },
  leftBorder: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Colors.dark.accent + '40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  failedBadge: {
    backgroundColor: Colors.dark.warning + '40',
  },
  statusText: {
    fontSize: 12,
    color: Colors.dark.text,
  },
  timestamp: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: Colors.dark.accent,
    fontSize: 14,
  },
  makerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  makerLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginRight: 8,
  },
  makerText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  signatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  signatureLabel: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginRight: 8,
  },
  signatureText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
});