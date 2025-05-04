import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface NotificationBannerProps {
  visible: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function NotificationBanner({
  visible,
  type,
  message,
  onDismiss,
  autoHide = true,
  duration = 3000,
}: NotificationBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  
  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
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
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  const handleDismiss = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.dark.successBackground;
      case 'error':
        return Colors.dark.warningBackground;
      case 'warning':
        return Colors.dark.warningBackground;
      case 'info':
        return Colors.dark.infoBackground;
      default:
        return Colors.dark.infoBackground;
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return Colors.dark.success;
      case 'error':
        return Colors.dark.warning;
      case 'warning':
        return Colors.dark.warning;
      case 'info':
        return Colors.dark.accent;
      default:
        return Colors.dark.accent;
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={Colors.dark.success} />;
      case 'error':
        return <AlertCircle size={20} color={Colors.dark.warning} />;
      case 'warning':
        return <AlertTriangle size={20} color={Colors.dark.warning} />;
      case 'info':
        return <Info size={20} color={Colors.dark.accent} />;
      default:
        return <Info size={20} color={Colors.dark.accent} />;
    }
  };
  
  if (!visible && slideAnim._value === -100) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <X size={16} color={Colors.dark.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});