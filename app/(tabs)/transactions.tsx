import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import TransactionItem from '@/components/TransactionItem';
import LoadingOverlay from '@/components/LoadingOverlay';
import ErrorMessage from '@/components/ErrorMessage';
import { transactionOperations } from '@/services/supabase';

export default function TransactionsScreen() {
  const { wallet, transactions, isLoading, error, setError } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'sales'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.connected) {
      loadTransactions();
    }
  }, [wallet.connected]);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const loadTransactions = async () => {
    if (!wallet.connected || !wallet.address) {
      setErrorMessage('Please connect your wallet to view transactions');
      return;
    }

    setRefreshing(true);
    try {
      // Fetch transactions from Supabase
      const fetchedTransactions = await transactionOperations.getTransactions(wallet.address);
      
      if (fetchedTransactions && fetchedTransactions.length > 0) {
        // Convert to the format expected by the UI
        const formattedTransactions = fetchedTransactions.map(tx => ({
          id: tx.id?.toString() || Math.random().toString(36).substring(2, 15),
          type: tx.type as 'purchase' | 'sale',
          amount: tx.amount,
          currency: tx.currency,
          tokens: tx.tokens,
          tokenCurrency: tx.token_currency,
          address: tx.wallet_address,
          timestamp: new Date(tx.timestamp || Date.now()).getTime(),
          status: tx.status as 'completed' | 'pending' | 'failed',
          signature: tx.signature,
          maker: tx.maker
        }));
        
        setLocalTransactions(formattedTransactions);
      } else {
        // If no transactions found in Supabase, use the ones from the store
        setLocalTransactions(transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setErrorMessage('Failed to load transactions');
      if (setError) {
        setError('Failed to load transactions');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await loadTransactions();
  };

  const filteredTransactions = localTransactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'purchases') return transaction.type === 'purchase';
    if (filter === 'sales') return transaction.type === 'sale';
    return true;
  });

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No transactions found</Text>
      {wallet.connected ? (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={18} color={Colors.dark.accent} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.emptySubtext}>Connect your wallet to view transactions</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.refreshIconButton} onPress={onRefresh}>
          <RefreshCw size={20} color={Colors.dark.accent} />
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <ErrorMessage 
          message={errorMessage} 
          onDismiss={() => setErrorMessage(null)} 
        />
      )}

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Filter size={16} color={filter === 'all' ? Colors.dark.text : Colors.dark.secondaryText} />
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'purchases' && styles.activeFilter]}
          onPress={() => setFilter('purchases')}
        >
          <ArrowDownLeft size={16} color={filter === 'purchases' ? Colors.dark.text : Colors.dark.secondaryText} />
          <Text style={[styles.filterText, filter === 'purchases' && styles.activeFilterText]}>Purchases</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'sales' && styles.activeFilter]}
          onPress={() => setFilter('sales')}
        >
          <ArrowUpRight size={16} color={filter === 'sales' ? Colors.dark.text : Colors.dark.secondaryText} />
          <Text style={[styles.filterText, filter === 'sales' && styles.activeFilterText]}>Sales</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.accent}
            colors={[Colors.dark.accent]}
          />
        }
      />

      <LoadingOverlay visible={isLoading && !refreshing} message="Loading transactions..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  refreshIconButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.dark.cardBackground,
  },
  activeFilter: {
    backgroundColor: Colors.dark.accent,
  },
  filterText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginLeft: 4,
  },
  activeFilterText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  refreshText: {
    color: Colors.dark.accent,
    marginLeft: 8,
    fontSize: 14,
  },
});