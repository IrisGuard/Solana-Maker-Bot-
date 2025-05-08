import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Settings, Save, RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/store/wallet-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Default bot settings to use if botSettings is undefined
const DEFAULT_BOT_SETTINGS = {
  mode: 'boost' as 'boost' | 'target' | 'advanced',
  targetPrice: '0.0001',
  makers: '100',
  hpepeAmount: '2000',
  solAmount: '0.175',
  minOrderAmount: '0.001',
  maxOrderAmount: '0.002',
  minDelay: '5',
  maxDelay: '10',
  tokenAction: 'sell' as 'sell' | 'return',
  sellTiming: 'each' as 'each' | 'all',
  manualBoost: '0',
  autoBoost: false,
  burnSmallAmounts: true,
  collectLargeAmounts: true,
  returnAfterCount: 50,
};

export default function BotSettingsPanel() {
  const { botSettings, setBotSettings } = useWalletStore();
  
  // Use default settings if botSettings is undefined
  const initialSettings = botSettings || DEFAULT_BOT_SETTINGS;
  
  const [settings, setSettings] = useState({
    mode: initialSettings.mode,
    targetPrice: initialSettings.targetPrice,
    makers: initialSettings.makers,
    hpepeAmount: initialSettings.hpepeAmount,
    solAmount: initialSettings.solAmount,
    minOrderAmount: initialSettings.minOrderAmount,
    maxOrderAmount: initialSettings.maxOrderAmount,
    minDelay: initialSettings.minDelay,
    maxDelay: initialSettings.maxDelay,
    tokenAction: initialSettings.tokenAction,
    sellTiming: initialSettings.sellTiming,
    manualBoost: initialSettings.manualBoost,
    autoBoost: initialSettings.autoBoost,
    burnSmallAmounts: initialSettings.burnSmallAmounts,
    collectLargeAmounts: initialSettings.collectLargeAmounts,
    returnAfterCount: initialSettings.returnAfterCount,
  });
  
  const handleChange = (key: string, value: string | boolean | 'boost' | 'target' | 'advanced' | 'sell' | 'return' | 'each' | 'all' | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (setBotSettings) {
      setBotSettings(settings);
    }
  };
  
  const handleReset = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSettings({
      mode: 'boost',
      targetPrice: '0.0001',
      makers: '100',
      hpepeAmount: '2000',
      solAmount: '0.175',
      minOrderAmount: '0.001',
      maxOrderAmount: '0.002',
      minDelay: '5',
      maxDelay: '10',
      tokenAction: 'sell',
      sellTiming: 'each',
      manualBoost: '0',
      autoBoost: false,
      burnSmallAmounts: true,
      collectLargeAmounts: true,
      returnAfterCount: 50,
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ρυθμίσεις Bot</Text>
        <Settings size={20} color={Colors.dark.accent} />
      </View>
      
      <View style={styles.modeSelector}>
        <TouchableOpacity 
          style={[styles.modeButton, settings.mode === 'boost' && styles.modeButtonActive]}
          onPress={() => handleChange('mode', 'boost')}
        >
          <Text style={[styles.modeButtonText, settings.mode === 'boost' && styles.modeButtonTextActive]}>
            Boost
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modeButton, settings.mode === 'target' && styles.modeButtonActive]}
          onPress={() => handleChange('mode', 'target')}
        >
          <Text style={[styles.modeButtonText, settings.mode === 'target' && styles.modeButtonTextActive]}>
            Target
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modeButton, settings.mode === 'advanced' && styles.modeButtonActive]}
          onPress={() => handleChange('mode', 'advanced')}
        >
          <Text style={[styles.modeButtonText, settings.mode === 'advanced' && styles.modeButtonTextActive]}>
            Advanced
          </Text>
        </TouchableOpacity>
      </View>
      
      {settings.mode === 'target' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Τιμή Στόχος</Text>
          <TextInput
            style={styles.input}
            value={settings.targetPrice}
            onChangeText={(value) => handleChange('targetPrice', value)}
            keyboardType="decimal-pad"
            placeholder="0.0001"
            placeholderTextColor={Colors.dark.secondaryText}
          />
        </View>
      )}
      
      {settings.mode === 'boost' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Αριθμός Makers</Text>
            <TextInput
              style={styles.input}
              value={settings.makers}
              onChangeText={(value) => handleChange('makers', value)}
              keyboardType="number-pad"
              placeholder="100"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ποσότητα HPEPE</Text>
            <TextInput
              style={styles.input}
              value={settings.hpepeAmount}
              onChangeText={(value) => handleChange('hpepeAmount', value)}
              keyboardType="number-pad"
              placeholder="2000"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ποσότητα SOL</Text>
            <TextInput
              style={styles.input}
              value={settings.solAmount}
              onChangeText={(value) => handleChange('solAmount', value)}
              keyboardType="decimal-pad"
              placeholder="0.175"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
        </>
      )}
      
      {settings.mode === 'advanced' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ελάχιστο Ποσό Εντολής (SOL)</Text>
            <TextInput
              style={styles.input}
              value={settings.minOrderAmount}
              onChangeText={(value) => handleChange('minOrderAmount', value)}
              keyboardType="decimal-pad"
              placeholder="0.001"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Μέγιστο Ποσό Εντολής (SOL)</Text>
            <TextInput
              style={styles.input}
              value={settings.maxOrderAmount}
              onChangeText={(value) => handleChange('maxOrderAmount', value)}
              keyboardType="decimal-pad"
              placeholder="0.002"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ελάχιστη Καθυστέρηση (δευτ.)</Text>
            <TextInput
              style={styles.input}
              value={settings.minDelay}
              onChangeText={(value) => handleChange('minDelay', value)}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Μέγιστη Καθυστέρηση (δευτ.)</Text>
            <TextInput
              style={styles.input}
              value={settings.maxDelay}
              onChangeText={(value) => handleChange('maxDelay', value)}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Επιστροφή μετά από (συναλλαγές)</Text>
            <TextInput
              style={styles.input}
              value={settings.returnAfterCount.toString()}
              onChangeText={(value) => handleChange('returnAfterCount', parseInt(value) || 50)}
              keyboardType="number-pad"
              placeholder="50"
              placeholderTextColor={Colors.dark.secondaryText}
            />
          </View>
        </>
      )}
      
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Επιλογές Tokens</Text>
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Ενέργεια μετά την αγορά</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity 
              style={[
                styles.segmentButton, 
                settings.tokenAction === 'sell' && styles.segmentButtonActive
              ]}
              onPress={() => handleChange('tokenAction', 'sell')}
            >
              <Text style={[
                styles.segmentButtonText,
                settings.tokenAction === 'sell' && styles.segmentButtonTextActive
              ]}>
                Πώληση
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.segmentButton, 
                settings.tokenAction === 'return' && styles.segmentButtonActive
              ]}
              onPress={() => handleChange('tokenAction', 'return')}
            >
              <Text style={[
                styles.segmentButtonText,
                settings.tokenAction === 'return' && styles.segmentButtonTextActive
              ]}>
                Επιστροφή
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {settings.tokenAction === 'sell' && (
          <View style={styles.optionItem}>
            <Text style={styles.optionLabel}>Χρόνος πώλησης</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={[
                  styles.segmentButton, 
                  settings.sellTiming === 'each' && styles.segmentButtonActive
                ]}
                onPress={() => handleChange('sellTiming', 'each')}
              >
                <Text style={[
                  styles.segmentButtonText,
                  settings.sellTiming === 'each' && styles.segmentButtonTextActive
                ]}>
                  Κάθε αγορά
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.segmentButton, 
                  settings.sellTiming === 'all' && styles.segmentButtonActive
                ]}
                onPress={() => handleChange('sellTiming', 'all')}
              >
                <Text style={[
                  styles.segmentButtonText,
                  settings.sellTiming === 'all' && styles.segmentButtonTextActive
                ]}>
                  Όλες μαζί
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>"Κάψιμο" μικρών ποσών</Text>
          <Switch
            value={settings.burnSmallAmounts}
            onValueChange={(value) => handleChange('burnSmallAmounts', value)}
            trackColor={{ false: Colors.dark.inactive, true: Colors.dark.accent }}
            thumbColor={Colors.dark.text}
          />
        </View>
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Συλλογή μεγάλων ποσών</Text>
          <Switch
            value={settings.collectLargeAmounts}
            onValueChange={(value) => handleChange('collectLargeAmounts', value)}
            trackColor={{ false: Colors.dark.inactive, true: Colors.dark.accent }}
            thumbColor={Colors.dark.text}
          />
        </View>
        
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Αυτόματη ενίσχυση</Text>
          <Switch
            value={settings.autoBoost}
            onValueChange={(value) => handleChange('autoBoost', value)}
            trackColor={{ false: Colors.dark.inactive, true: Colors.dark.accent }}
            thumbColor={Colors.dark.text}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <RotateCcw size={18} color={Colors.dark.text} />
          <Text style={styles.buttonText}>Επαναφορά</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Save size={18} color={Colors.dark.text} />
          <Text style={styles.buttonText}>Αποθήκευση</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 4,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  modeButtonActive: {
    backgroundColor: Colors.dark.accent,
  },
  modeButtonText: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  modeButtonTextActive: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 4,
    padding: 10,
    color: Colors.dark.text,
    fontSize: 14,
  },
  optionsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.dark.secondaryText,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  segmentButtonActive: {
    backgroundColor: Colors.dark.accent,
  },
  segmentButtonText: {
    fontSize: 12,
    color: Colors.dark.secondaryText,
  },
  segmentButtonTextActive: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
    gap: 8,
  },
  resetButton: {
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  saveButton: {
    backgroundColor: Colors.dark.accent,
  },
  buttonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
});