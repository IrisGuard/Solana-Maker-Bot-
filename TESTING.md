# HPEPE Bot Testing Guide

This document provides a comprehensive testing guide for the HPEPE Bot application. Follow these steps to test all major features and functionality.

## Prerequisites

- A device with Expo Go installed (iOS/Android)
- Or a web browser for web testing
- Internet connection
- (Optional) A Solana wallet (Phantom, Solflare, etc.)

## Testing Checklist

### 1. Installation and Setup

- [ ] Clone the repository
- [ ] Install dependencies with `npm install` or `yarn install`
- [ ] Create `.env` file from `.env.example`
- [ ] Start the app with `npx expo start --tunnel`
- [ ] Scan QR code with Expo Go

### 2. Onboarding

- [ ] Verify welcome screen appears on first launch
- [ ] Navigate through onboarding screens
- [ ] Complete onboarding process
- [ ] Verify onboarding is skipped on subsequent launches

### 3. Wallet Connection

- [ ] Tap "Connect Wallet" on home screen
- [ ] Verify wallet selection modal appears
- [ ] Select a wallet provider
- [ ] Authorize connection in wallet app
- [ ] Verify wallet address appears on home screen
- [ ] Verify balance information is displayed

### 4. Token Management

- [ ] Navigate to Tokens tab
- [ ] Verify HPEPE token is displayed (if in wallet)
- [ ] Verify SOL balance is displayed
- [ ] Tap "+" to add a custom token
- [ ] Enter a valid Solana token address
- [ ] Verify token is added to the list
- [ ] Verify token price chart displays correctly

### 5. Bot Control

- [ ] Navigate to Bot Control tab
- [ ] Verify API status is displayed
- [ ] Configure bot settings (frequency, volume)
- [ ] Tap "Start Bot"
- [ ] Verify bot status changes to "Active"
- [ ] Verify simulation indicators are displayed
- [ ] Tap "Stop Bot"
- [ ] Verify bot status changes to "Inactive"

### 6. Transaction Simulation

- [ ] Start the bot in simulation mode
- [ ] Navigate to Transactions tab
- [ ] Verify simulated transactions appear in the list
- [ ] Verify transaction details are displayed correctly
- [ ] Tap on a transaction to view details
- [ ] Verify transaction status updates correctly

### 7. Settings

- [ ] Navigate to Settings tab
- [ ] Toggle Simulation Mode
- [ ] Verify notification appears confirming the change
- [ ] Tap "Help & FAQ"
- [ ] Verify help content is displayed
- [ ] Tap "Privacy Policy"
- [ ] Verify privacy policy is displayed
- [ ] Tap "Terms of Service"
- [ ] Verify terms of service is displayed
- [ ] Tap "Clear All Data"
- [ ] Verify confirmation dialog appears
- [ ] Confirm data clearing
- [ ] Verify all data is reset

### 8. API Fallback Testing

- [ ] Enable airplane mode or disconnect from internet
- [ ] Refresh the app
- [ ] Verify app switches to simulation mode
- [ ] Verify appropriate error messages are displayed
- [ ] Reconnect to internet
- [ ] Verify app recovers and connects to APIs

### 9. Performance Testing

- [ ] Test app performance with multiple tokens
- [ ] Test app performance with many transactions
- [ ] Verify app remains responsive during bot operation
- [ ] Test memory usage over extended periods

### 10. Cross-Platform Testing

- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web browser
- [ ] Verify UI adapts correctly to different screen sizes

## Resetting Supabase (If Needed)

If you need to reset the Supabase database during testing:

1. Log in to the Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Clear all tables
TRUNCATE wallets CASCADE;
TRUNCATE transactions CASCADE;
TRUNCATE tokens CASCADE;

-- Reset sequences
ALTER SEQUENCE wallets_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE tokens_id_seq RESTART WITH 1;
```

## Reporting Issues

When reporting issues, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or recordings if possible
- Device information (OS, model, etc.)
- Error messages (if any)

Submit issues to the GitHub repository or contact support@symfonny.com.