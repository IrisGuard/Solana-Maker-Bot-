import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'paused';
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return Colors.dark.positive;
      case 'paused':
        return Colors.dark.warning;
      case 'inactive':
      default:
        return Colors.dark.inactive;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Ενεργό';
      case 'paused':
        return 'Σε παύση';
      case 'inactive':
      default:
        return 'Ανενεργό';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
});