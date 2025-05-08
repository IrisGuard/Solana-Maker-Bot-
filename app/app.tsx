import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useWalletStore } from '@/store/wallet-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { fetchSolanaTokenPrice, fetchHpepeTokenPrice, fetchSolanaHistoricalPrices } = useWalletStore();
  
  useEffect(() => {
    // Fetch initial token prices
    fetchSolanaTokenPrice();
    fetchHpepeTokenPrice();
    fetchSolanaHistoricalPrices();
    
    // Set up interval to refresh prices every 30 seconds
    const interval = setInterval(() => {
      fetchSolanaTokenPrice();
      fetchHpepeTokenPrice();
    }, 30000);
    
    // Set up interval to refresh historical prices every 5 minutes
    const historyInterval = setInterval(() => {
      fetchSolanaHistoricalPrices();
    }, 300000);
    
    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, []);
  
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        <Stack.Screen name="index" options={{ title: 'Solana Maker Bot' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Solana Maker Bot' }} />
      </Stack>
    </SafeAreaProvider>
  );
}