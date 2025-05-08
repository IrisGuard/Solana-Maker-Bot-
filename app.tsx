import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';
import { Home, Wallet, Settings, Activity } from 'lucide-react-native';

// Import screens
import HomeScreen from '@/app/(tabs)/index';
import TokensScreen from '@/app/(tabs)/tokens';
import TransactionsScreen from '@/app/(tabs)/transactions';
import BotControlScreen from '@/app/(tabs)/bot-control';
import SettingsScreen from '@/app/(tabs)/settings';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[isDark ? 'dark' : 'light'].accent,
          tabBarInactiveTintColor: Colors[isDark ? 'dark' : 'light'].secondaryText,
          tabBarStyle: {
            backgroundColor: Colors[isDark ? 'dark' : 'light'].cardBackground,
            borderTopColor: Colors[isDark ? 'dark' : 'light'].border,
          },
          headerStyle: {
            backgroundColor: Colors[isDark ? 'dark' : 'light'].cardBackground,
          },
          headerTintColor: Colors[isDark ? 'dark' : 'light'].text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="BotControl"
          component={BotControlScreen}
          options={{
            title: 'Bot Control',
            tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Tokens"
          component={TokensScreen}
          options={{
            title: 'Tokens',
            tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 