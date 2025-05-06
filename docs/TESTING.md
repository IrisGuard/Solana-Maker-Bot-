# HPEPE Bot Testing Guide

This document provides step-by-step instructions for testing the HPEPE Bot application.

## Prerequisites

Before testing, ensure you have:

1. Installed the application (see README.md for installation instructions)
2. Set up Supabase with the required tables
3. Configured environment variables in `.env` file
4. Started the application with `npx expo start --tunnel` for mobile testing

## Testing Checklist

### 1. Initial Setup and Configuration

- [ ] Application loads without errors
- [ ] Supabase connection is established
- [ ] API status shows at least some endpoints as active
- [ ] Simulation mode is enabled by default

### 2. Wallet Connection

#### Testing Wallet Connection:

1. Navigate to the Wallet tab
2. Tap "Connect with Wallet"
3. Select a wallet provider (Phantom, Solflare, etc.)
4. Authorize the connection in your wallet app
5. Verify wallet address appears in the app
6. Check that SOL and token balances are displayed

#### Expected Results:

- Wallet address should be displayed
- SOL balance should be accurate
- Connected wallet should be saved in Supabase

### 3. Token Management

#### Testing Token Fetching:

1. Navigate to the Tokens tab
2. Verify HPEPE token is displayed
3. Check token price and balance
4. Tap "Add Token" to add a custom token
5. Enter a valid Solana token address
6. Verify the new token appears in the list

#### Expected Results:

- HPEPE token should be displayed with current price
- Custom tokens should be added successfully
- Token balances should match wallet balances

### 4. Bot Control

#### Testing Bot Settings:

1. Navigate to the Bot Control tab
2. Switch between Boost, Target, and Advanced tabs
3. Configure settings in each tab:
   - Boost: Set number of makers, HPEPE amount, SOL amount
   - Target: Set target price and aggressiveness
   - Advanced: Configure min/max order amounts, delays, etc.
4. Save settings and verify they persist

#### Testing Bot Activation:

1. Ensure simulation mode is enabled
2. Tap "Start Bot" button
3. Verify bot status changes to "Active"
4. Wait for transactions to appear in the Transactions tab
5. Verify transactions show both buy and sell operations
6. Check that transactions are saved in Supabase

#### Expected Results:

- Bot should start generating transactions
- Transactions should appear in the list
- Bot status metrics should update (active makers, transactions count)
- Transactions should be saved in Supabase

### 5. Transaction Monitoring

#### Testing Transaction List:

1. Navigate to the Transactions tab
2. Verify transactions are displayed in chronological order
3. Check that both buy and sell transactions are shown
4. Verify transaction details (amount, tokens, timestamp)
5. Pull to refresh and check for new transactions

#### Expected Results:

- Transactions should be displayed correctly
- Refreshing should load the latest transactions
- Transaction details should be accurate

### 6. Settings and Configuration

#### Testing Settings:

1. Navigate to the Settings tab
2. Toggle Simulation Mode on/off
3. Check Help & Support, Privacy Policy, and Terms of Service
4. Test "Clear All Data" functionality

#### Expected Results:

- Simulation Mode toggle should work
- Modal dialogs should open and close correctly
- Clearing data should reset the application state

### 7. API Status Monitoring

#### Testing API Status:

1. Navigate to the Wallet tab
2. Check the API Status component
3. Tap to expand and view endpoint details
4. Tap refresh button to check status again

#### Expected Results:

- API Status should show percentage of working endpoints
- Expanding should show individual endpoint status
- Refreshing should update the status

### 8. Error Handling

#### Testing Error Scenarios:

1. Disconnect from the internet and try to connect wallet
2. Enter an invalid token address
3. Try to start the bot without proper configuration

#### Expected Results:

- Appropriate error messages should be displayed
- Application should not crash
- Fallback to offline/simulation mode should occur

## Cross-Platform Testing

### Mobile (Expo Go)

1. Scan the QR code with Expo Go app
2. Verify all functionality works on mobile
3. Test on both iOS and Android if possible

### Web

1. Open the web version (http://localhost:19006 or deployed URL)
2. Verify all functionality works in the browser
3. Test responsive design on different screen sizes

## Final Verification

After completing all tests, verify that:

1. All transactions are properly recorded in Supabase
2. Wallet connections are saved
3. Bot settings persist between sessions
4. The application works in both online and offline modes
5. Simulation mode prevents real blockchain transactions

## Reporting Issues

If you encounter any issues during testing, please report them with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots or error messages
5. Device/browser information

   
