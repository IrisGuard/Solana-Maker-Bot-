import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PrivacyPolicyProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ visible, onClose }: PrivacyPolicyProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.container}>
          <Text style={styles.date}>Last Updated: June 15, 2023</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to the Solana Maker Bot ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service").
            </Text>
            <Text style={styles.paragraph}>
              Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            
            <Text style={styles.subsectionTitle}>2.1 Information You Provide</Text>
            <Text style={styles.paragraph}>
              We may collect information that you provide directly to us when you:
            </Text>
            <Text style={styles.bulletPoint}>• Connect your wallet to our Service</Text>
            <Text style={styles.bulletPoint}>• Create or modify your account profile</Text>
            <Text style={styles.bulletPoint}>• Configure bot settings</Text>
            <Text style={styles.bulletPoint}>• Contact our customer support</Text>
            <Text style={styles.bulletPoint}>• Respond to surveys or promotions</Text>
            
            <Text style={styles.subsectionTitle}>2.2 Wallet Information</Text>
            <Text style={styles.paragraph}>
              When you connect your Solana wallet to our Service, we may collect:
            </Text>
            <Text style={styles.bulletPoint}>• Your wallet address</Text>
            <Text style={styles.bulletPoint}>• Token balances</Text>
            <Text style={styles.bulletPoint}>• Transaction history</Text>
            <Text style={styles.paragraph}>
              We do not collect or store private keys, seed phrases, or other credentials that could be used to access your wallet.
            </Text>
            
            <Text style={styles.subsectionTitle}>2.3 Automatically Collected Information</Text>
            <Text style={styles.paragraph}>
              When you use our Service, we may automatically collect certain information, including:
            </Text>
            <Text style={styles.bulletPoint}>• Device information (model, operating system, unique device identifiers)</Text>
            <Text style={styles.bulletPoint}>• IP address and location information</Text>
            <Text style={styles.bulletPoint}>• Usage data and interaction with the Service</Text>
            <Text style={styles.bulletPoint}>• Performance data and error reports</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect for various purposes, including:
            </Text>
            <Text style={styles.bulletPoint}>• Providing, maintaining, and improving our Service</Text>
            <Text style={styles.bulletPoint}>• Processing transactions and executing bot operations</Text>
            <Text style={styles.bulletPoint}>• Communicating with you about updates, security alerts, and support</Text>
            <Text style={styles.bulletPoint}>• Analyzing usage patterns and optimizing user experience</Text>
            <Text style={styles.bulletPoint}>• Detecting, preventing, and addressing technical issues or fraudulent activities</Text>
            <Text style={styles.bulletPoint}>• Complying with legal obligations</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
            <Text style={styles.paragraph}>
              We use Supabase for data storage, which implements industry-standard security measures to protect your information. Your data is stored in encrypted form and protected by access controls. We regularly review our security practices to ensure the ongoing confidentiality, integrity, and availability of your information.
            </Text>
            <Text style={styles.paragraph}>
              While we implement safeguards designed to protect your information, no security system is impenetrable. Due to the inherent nature of the Internet, we cannot guarantee that information, during transmission or while stored on our systems, is absolutely safe from intrusion by others.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Sharing Your Information</Text>
            <Text style={styles.paragraph}>
              We may share your information in the following circumstances:
            </Text>
            <Text style={styles.bulletPoint}>• With service providers who perform services on our behalf</Text>
            <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
            <Text style={styles.bulletPoint}>• To protect and defend our rights and property</Text>
            <Text style={styles.bulletPoint}>• With your consent or at your direction</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information to third parties.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
            <Text style={styles.paragraph}>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </Text>
            <Text style={styles.bulletPoint}>• Accessing, correcting, or deleting your information</Text>
            <Text style={styles.bulletPoint}>• Restricting or objecting to our use of your information</Text>
            <Text style={styles.bulletPoint}>• Portability of your information</Text>
            <Text style={styles.bulletPoint}>• Withdrawing consent</Text>
            <Text style={styles.paragraph}>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Changes to This Privacy Policy</Text>
            <Text style={styles.paragraph}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: privacy@symfonny.com</Text>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 12,
    marginBottom: 8,
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