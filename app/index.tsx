import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';

export default function Index() {
  // Directly redirect to the main app
  return <Redirect href="/(tabs)" />;
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