import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Eye, Copy, Key, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import * as Haptics from 'expo-haptics';

type KeyCardProps = {
  type: string;
  name: string;
  label: string;
  platform?: string;
  primary?: boolean;
  id: string;
  createdAt: string;
};

export default function KeyCard({ type, name, label, platform, primary, id, createdAt }: KeyCardProps) {
  const { deleteKey } = useWalletStore();

  const handleCopyId = async () => {
    try {
      // In a real app, you would use Clipboard.setStringAsync
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Αντιγράφηκε', 'Το ID αντιγράφηκε στο πρόχειρο');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyKey = async () => {
    try {
      // In a real app, you would decrypt and copy the actual key
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Αντιγράφηκε', 'Το κλειδί αντιγράφηκε στο πρόχειρο');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Διαγραφή Κλειδιού',
      'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το κλειδί;',
      [
        {
          text: 'Ακύρωση',
          style: 'cancel',
        },
        {
          text: 'Διαγραφή',
          style: 'destructive',
          onPress: () => {
            deleteKey(id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Key size={18} color={Colors.dark.accent} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.label}>{label}</Text>
          {platform && <Text style={styles.platform}>{platform}</Text>}
          {primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Eye size={20} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Trash2 size={20} color={Colors.dark.warning} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Label / ID:</Text>
        <View style={styles.idContainer}>
          <Text style={styles.idText}>{id}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyId}>
            <Copy size={16} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Key:</Text>
        <Text style={styles.hiddenKey}>••••••••••••••••••••</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyKey}>
          <Copy size={16} color={Colors.dark.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.createdAt}>Δημιουργήθηκε: {createdAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  name: {
    color: Colors.dark.accent,
    fontWeight: '600',
    fontSize: 16,
  },
  label: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginLeft: 4,
  },
  platform: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginLeft: 4,
  },
  primaryBadge: {
    backgroundColor: '#5D4037',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  primaryText: {
    color: '#FFB74D',
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    color: Colors.dark.secondaryText,
    width: 80,
    fontSize: 14,
  },
  idContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    color: Colors.dark.text,
    flex: 1,
    fontSize: 14,
  },
  hiddenKey: {
    color: Colors.dark.text,
    flex: 1,
    fontSize: 14,
  },
  copyButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  createdAt: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
  },
});