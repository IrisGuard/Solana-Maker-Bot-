import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { ArrowRight } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Solana Maker Bot",
      description: "Your automated trading companion for the Solana blockchain. Let's get you set up in just a few steps.",
    },
    {
      title: "Automated Trading",
      description: "Create custom trading bots that execute your strategies 24/7 without manual intervention.",
    },
    {
      title: "Portfolio Management",
      description: "Track your Solana assets, monitor performance, and analyze your trading history.",
    },
    {
      title: "Ready to Start?",
      description: "You're all set to begin your automated trading journey on Solana.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error saving onboarding status:', e);
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error saving onboarding status:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.appName}>Solana Maker Bot</Text>
        {currentStep < steps.length - 1 && (
          <TouchableOpacity onPress={skipOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.stepsIndicator}>
        {steps.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.stepDot, 
              currentStep === index ? styles.activeStepDot : null
            ]} 
          />
        ))}
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
      </ScrollView>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentStep < steps.length - 1 ? "Next" : "Get Started"}
        </Text>
        <ArrowRight size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  skipText: {
    fontSize: 16,
    color: Colors.dark.accent,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.inactive,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: Colors.dark.accent,
    width: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 18,
    color: Colors.dark.secondaryText,
    textAlign: 'center',
    lineHeight: 26,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.accent,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginHorizontal: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});