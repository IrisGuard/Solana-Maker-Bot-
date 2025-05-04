import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ErrorMessageProps {
  message: string | object;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function ErrorMessage({
  message,
  onDismiss,
  autoHide = true,
  duration = 5000,
}: ErrorMessageProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Format error message to ensure it's a string
  const formatErrorMessage = (msg: string | object): string => {
    if (typeof msg === 'string') return msg;
    
    if (msg === null || msg === undefined) return 'Unknown error';
    
    if (typeof msg === 'object') {
      // Try to extract message from error object
      if ('message' in msg && typeof (msg as any).message === 'string') {
        return (msg as any).message;
      }
      
      if ('error' in msg && typeof (msg as any).error === 'string') {
        return (msg as any).error;
      }
      
      if ('details' in msg && typeof (msg as any).details === 'string') {
        return (msg as any).details;
      }
      
      if ('error_description' in msg && typeof (msg as any).error_description === 'string') {
        return (msg as any).error_description;
      }
      
      // Try to stringify the object
      try {
        return JSON.stringify(msg);
      } catch (e) {
        return 'Error object could not be displayed';
      }
    }
    
    return String(msg);
  };
  
  const errorText = formatErrorMessage(message);
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after duration
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.message}>{errorText}</Text>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <X size={16} color={Colors.dark.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.warningBackground,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.warning,
  },
  message: {
    color: Colors.dark.text,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
});