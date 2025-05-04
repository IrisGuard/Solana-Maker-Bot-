import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Sun, Info, HelpCircle, Shield, FileText, Github, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import NotificationBanner from '@/components/NotificationBanner';
import HelpSupportContent from '@/components/HelpSupportContent';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';

export default function SettingsScreen() {
  const { botStatus, clearAllData, setSimulationMode } = useWalletStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(botStatus?.simulationMode || true);
  const [showClearDataDialog, setShowClearDataDialog] = useState<boolean>(false);
  const [showHelpSupport, setShowHelpSupport] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showTermsOfService, setShowTermsOfService] = useState<boolean>(false);
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: '',
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    showNotification('info', 'Theme setting will be available in a future update.');
  };

  const handleToggleSimulationMode = () => {
    const newMode = !isSimulationMode;
    setIsSimulationMode(newMode);
    if (setSimulationMode) {
      setSimulationMode(newMode);
    }
    showNotification('success', `Simulation mode ${newMode ? 'enabled' : 'disabled'}.`);
  };

  const handleClearAllData = () => {
    setShowClearDataDialog(true);
  };

  const confirmClearAllData = () => {
    if (clearAllData) {
      clearAllData();
    }
    setShowClearDataDialog(false);
    showNotification('warning', 'All data has been cleared.');
  };

  const handleOpenGithub = () => {
    const url = 'https://github.com/IrisGuard/SYMFONNY-WALLET-BOT-';
    
    if (Platform.OS !== 'web') {
      Linking.openURL(url).catch(err => {
        showNotification('error', 'Could not open GitHub repository.');
      });
    } else {
      window.open(url, '_blank');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({
      visible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Enable dark theme for the app</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
              thumbColor={isDarkMode ? Colors.dark.gold : Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Simulation Mode</Text>
              <Text style={styles.settingDescription}>Run the bot in simulation mode without real transactions</Text>
            </View>
            <Switch
              value={isSimulationMode}
              onValueChange={handleToggleSimulationMode}
              trackColor={{ false: Colors.dark.border, true: Colors.dark.accent }}
              thumbColor={isSimulationMode ? Colors.dark.gold : Colors.dark.secondaryText}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutTitle}>HPEPE Bot</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A Solana token price booster application that simulates transactions to increase token visibility and trading volume.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.linkItem} onPress={handleOpenGithub}>
            <Github size={20} color={Colors.dark.accent} />
            <Text style={styles.linkText}>GitHub Repository</Text>
            <ExternalLink size={16} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>
          
          <TouchableOpacity style={styles.linkItem}
            onPress={() => setShowHelpSupport(true)}>
            <Info size={20} color={Colors.dark.accent} />
            <Text style={styles.linkText}>Help & FAQ</Text>
            <ExternalLink size={16} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}
            onPress={() => setShowPrivacyPolicy(true)}>
            <Shield size={20} color={Colors.dark.accent} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <ExternalLink size={16} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}
            onPress={() => setShowTermsOfService(true)}>
            <FileText size={20} color={Colors.dark.accent} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <ExternalLink size={16} color={Colors.dark.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={Colors.dark.warning} />
            <Text style={styles.sectionTitle}>Danger Zone</Text>
          </View>
          
          <TouchableOpacity style={styles.dangerButton}
            onPress={handleClearAllData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
          
          <Text style={styles.dangerDescription}>
            This will permanently delete all your saved data, including wallet connections, keys, and transaction history.
          </Text>
        </View>
      </ScrollView>
      
      <ConfirmationDialog
        visible={showClearDataDialog}
        title="Clear All Data"
        message="Are you sure you want to clear all data? This action cannot be undone."
        confirmText="Clear Data"
        cancelText="Cancel"
        onConfirm={confirmClearAllData}
        onCancel={() => setShowClearDataDialog(false)}
        type="danger"
      />
      
      {showHelpSupport && (
        <HelpSupportContent
          visible={showHelpSupport}
          onClose={() => setShowHelpSupport(false)}
        />
      )}
      
      {showPrivacyPolicy && (
        <PrivacyPolicy
          visible={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      )}
      
      {showTermsOfService && (
        <TermsOfService
          visible={showTermsOfService}
          onClose={() => setShowTermsOfService(false)}
        />
      )}
      
      <NotificationBanner
        visible={notification.visible}
        type={notification.type}
        message={notification.message}
        onDismiss={hideNotification}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  aboutItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    color: Colors.dark.text,
    flex: 1,
  },
  dangerButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: Colors.dark.warning,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  dangerButtonText: {
    color: Colors.dark.warning,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerDescription: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginTop: 8,
    lineHeight: 20,
  },
});