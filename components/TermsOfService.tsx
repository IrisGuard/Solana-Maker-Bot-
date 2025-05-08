import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface TermsOfServiceProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsOfService({ visible, onClose }: TermsOfServiceProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.container}>
          <Text style={styles.date}>Last Updated: June 15, 2023</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              Welcome to Solana Maker Bot. These Terms of Service ("Terms") govern your access to and use of the Solana Maker Bot mobile application and all related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.paragraph}>
              Solana Maker Bot is a Solana token price booster application that simulates trading activity to potentially influence token price perception. The Service provides tools for connecting to Solana wallets, viewing token balances, and executing simulated or real trading strategies.
            </Text>
            <Text style={styles.paragraph}>
              By default, the Service operates in simulation mode and does not execute real blockchain transactions unless explicitly configured by the user.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Eligibility</Text>
            <Text style={styles.paragraph}>
              You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
            </Text>
            <Text style={styles.paragraph}>
              You also represent and warrant that your use of the Service does not violate any applicable law or regulation in your jurisdiction.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Accounts and Wallet Connection</Text>
            <Text style={styles.paragraph}>
              To use certain features of the Service, you may need to connect a Solana wallet. You are responsible for maintaining the security of your wallet and any associated private keys or seed phrases.
            </Text>
            <Text style={styles.paragraph}>
              You agree that:
            </Text>
            <Text style={styles.bulletPoint}>• You will not share your wallet credentials with any third party</Text>
            <Text style={styles.bulletPoint}>• You will not use the Service to engage in illegal activities</Text>
            <Text style={styles.bulletPoint}>• You will not attempt to gain unauthorized access to other users' accounts or data</Text>
            <Text style={styles.bulletPoint}>• You are solely responsible for all activities that occur under your account</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Risks and Disclaimers</Text>
            <Text style={styles.paragraph}>
              You acknowledge and agree that:
            </Text>
            <Text style={styles.bulletPoint}>• Cryptocurrency trading involves significant risk</Text>
            <Text style={styles.bulletPoint}>• The Service does not guarantee any specific results or returns</Text>
            <Text style={styles.bulletPoint}>• Market conditions can change rapidly and unpredictably</Text>
            <Text style={styles.bulletPoint}>• The Service may experience downtime or technical issues</Text>
            <Text style={styles.bulletPoint}>• Blockchain transactions are irreversible once confirmed</Text>
            <Text style={styles.paragraph}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SYMFONNY, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THE SERVICE.
            </Text>
            <Text style={styles.paragraph}>
              IN NO EVENT WILL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID US IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              You agree not to engage in any of the following prohibited activities:
            </Text>
            <Text style={styles.bulletPoint}>• Using the Service for any illegal purpose or in violation of any laws</Text>
            <Text style={styles.bulletPoint}>• Attempting to interfere with, compromise, or disrupt the Service</Text>
            <Text style={styles.bulletPoint}>• Attempting to decompile, reverse engineer, or disassemble the Service</Text>
            <Text style={styles.bulletPoint}>• Using the Service to manipulate markets in violation of applicable regulations</Text>
            <Text style={styles.bulletPoint}>• Impersonating another person or entity</Text>
            <Text style={styles.bulletPoint}>• Collecting user information without their consent</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The Service and its original content, features, and functionality are owned by Symfonny and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </Text>
            <Text style={styles.paragraph}>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date.
            </Text>
            <Text style={styles.paragraph}>
              Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions about these Terms, please contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: legal@symfonny.com</Text>
            <Text style={styles.contactInfo}>Address: 123 Blockchain Way, Crypto City, CC 12345</Text>
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
  date: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginLeft: 16,
    marginBottom: 6,
    lineHeight: 20,
  },
  contactInfo: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginTop: 4,
  },
});