import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { Mail, MessageCircle, HelpCircle, FileText, ExternalLink, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface HelpSupportContentProps {
  visible: boolean;
  onClose: () => void;
}

export default function HelpSupportContent({ visible, onClose }: HelpSupportContentProps) {
  const openEmail = () => {
    Linking.openURL('mailto:support@symfonny.com?subject=Solana%20Maker%20Bot%20Support');
  };

  const openTelegram = () => {
    Linking.openURL('https://t.me/symfonny_support');
  };

  const openDocs = () => {
    Linking.openURL('https://docs.symfonny.com');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What is the Solana Maker Bot?</Text>
              <Text style={styles.faqAnswer}>
                The Solana Maker Bot is a Solana token price booster that simulates trading activity to increase token visibility and potentially influence price through market perception.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is the bot creating real transactions?</Text>
              <Text style={styles.faqAnswer}>
                By default, the bot operates in simulation mode and does not create real blockchain transactions. Real transactions can be enabled in advanced settings, but this requires explicit configuration.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I connect my wallet?</Text>
              <Text style={styles.faqAnswer}>
                Click the "Connect Wallet" button on the home screen and select your preferred wallet provider (Phantom, Solflare, etc.). Follow the prompts to authorize the connection.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens if the Solana API is down?</Text>
              <Text style={styles.faqAnswer}>
                The app automatically switches to simulation mode if it cannot connect to Solana APIs. It will periodically attempt to reconnect and notify you when connectivity is restored.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I add custom tokens?</Text>
              <Text style={styles.faqAnswer}>
                Navigate to the Tokens tab and click the "+" button. Enter the token address and other details. The app will attempt to fetch metadata automatically but allows manual entry if needed.
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
              <Mail size={24} color={Colors.dark.accent} />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactDescription}>support@symfonny.com</Text>
              </View>
              <ExternalLink size={18} color={Colors.dark.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={openTelegram}>
              <MessageCircle size={24} color={Colors.dark.accent} />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Telegram Support</Text>
                <Text style={styles.contactDescription}>@symfonny_support</Text>
              </View>
              <ExternalLink size={18} color={Colors.dark.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={openDocs}>
              <FileText size={24} color={Colors.dark.accent} />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactTitle}>Documentation</Text>
                <Text style={styles.contactDescription}>docs.symfonny.com</Text>
              </View>
              <ExternalLink size={18} color={Colors.dark.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
            
            <View style={styles.troubleshootingItem}>
              <HelpCircle size={20} color={Colors.dark.warning} />
              <Text style={styles.troubleshootingText}>
                If the app fails to connect to Solana APIs, check your internet connection and try again. The app will automatically use simulation mode as a fallback.
              </Text>
            </View>
            
            <View style={styles.troubleshootingItem}>
              <HelpCircle size={20} color={Colors.dark.warning} />
              <Text style={styles.troubleshootingText}>
                If wallet connection fails, ensure your wallet app is installed and updated. Try disconnecting and reconnecting.
              </Text>
            </View>
            
            <View style={styles.troubleshootingItem}>
              <HelpCircle size={20} color={Colors.dark.warning} />
              <Text style={styles.troubleshootingText}>
                For performance issues, try clearing the app cache in settings or reinstalling the app.
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Solana Maker Bot v1.0.0
            </Text>
            <Text style={styles.footerText}>
              © 2023 Symfonny. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  troubleshootingItem: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  troubleshootingText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
    marginBottom: 4,
  },
});