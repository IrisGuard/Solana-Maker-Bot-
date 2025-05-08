import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import text from '@/constants/text';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'info' | 'danger';
};

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    if (Platform.OS !== 'web') {
      if (type === 'danger') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onCancel();
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return Colors.dark.warning;
      case 'info':
        return Colors.dark.accent;
      case 'warning':
      default:
        return Colors.dark.gold;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return styles.dangerButton;
      case 'info':
        return styles.infoButton;
      case 'warning':
      default:
        return styles.warningButton;
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.dialogBox}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={32} color={getIconColor()} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>
                {cancelText || text.cancel}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, getConfirmButtonStyle()]} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText || text.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dialogBox: {
    width: '85%',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: Colors.dark.secondaryText,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cancelButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: Colors.dark.gold,
  },
  dangerButton: {
    backgroundColor: Colors.dark.warning,
  },
  infoButton: {
    backgroundColor: Colors.dark.accent,
  },
  confirmButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
});