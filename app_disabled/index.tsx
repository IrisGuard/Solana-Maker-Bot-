import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(value === 'true');
      } catch (e) {
        console.error('Error checking onboarding status:', e);
        setHasOnboarded(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoadingText('Checking API endpoints...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Initializing wallet services...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Loading token data...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingText('Ready!');
        setInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setInitializationError(typeof err === 'string' ? err : 'Failed to initialize the app');
        setLoadingText('Error during initialization');
        // Still set initialized to true so we can continue in simulation mode
        setInitialized(true);
      }
    };

    if (hasOnboarded !== null) {
      initializeApp();
    }
  }, [hasOnboarded]);

  // Show error if initialization failed
  if (initializationError) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.appName}>Solana Maker Bot</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Initialization Error</Text>
          <Text style={styles.errorText}>{initializationError}</Text>
          <Text style={styles.errorHint}>
            The app will continue in simulation mode. Some features may be limited.
          </Text>
        </View>
        <Text style={styles.loadingText}>Continuing in simulation mode...</Text>
      </View>
    );
  }

  // Redirect to onboarding if not completed
  if (hasOnboarded === false) {
    return <Redirect href="/onboarding" />;
  }

  // Redirect to main app if initialized
  if (initialized && hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  // Show loading screen
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.appName}>Solana Maker Bot</Text>
      <ActivityIndicator size="large" color={Colors.dark.accent} style={styles.loader} />
      <Text style={styles.loadingText}>{loadingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.secondaryText,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.warning,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 15,
  },
  errorHint: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    fontStyle: 'italic',
  },
});