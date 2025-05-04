# HPEPE Bot Operation Explanation

This document explains how the HPEPE Bot operates, including its core functionality, strategies, and technical implementation.

## Overview

The HPEPE Bot is designed to simulate or execute trading activity for Solana tokens, with a focus on increasing token visibility and potentially influencing price through market perception. The bot creates a series of buy and sell transactions with configurable parameters to create the appearance of trading activity.

## Core Components

### 1. Wallet Management

The bot can:
- Connect to existing Solana wallets via wallet adapters (Phantom, Solflare, etc.)
- Create simulated "maker" wallets for transactions
- Track wallet balances and transaction history

### 2. Transaction Execution

For each transaction cycle, the bot:
1. Creates a new maker wallet with a unique ID
2. Executes a buy transaction with a random amount (between configured min/max)
3. Waits for a configurable delay period (50-60 seconds by default)
4. Executes a corresponding sell transaction
5. Optionally collects funds from large transactions

### 3. Simulation vs. Real Transactions

- **Simulation Mode**: All transactions are simulated and stored in Supabase, but no actual blockchain transactions occur
- **Real Transaction Mode**: Requires explicit configuration and connects to Solana RPC endpoints to execute actual transactions

## Bot Strategies

### Boost Strategy

The Boost strategy focuses on increasing trading volume with random transactions:

1. Creates multiple maker wallets
2. Executes buy/sell pairs with random amounts
3. Configurable parameters:
   - Number of maker wallets
   - HPEPE amount per transaction
   - SOL amount per transaction
   - Min/max order amounts
   - Min/max delay between transactions

### Target Strategy

The Target strategy aims for a specific price target:

1. Monitors current token price
2. Adjusts transaction volume based on distance from target
3. Configurable parameters:
   - Target price
   - Aggressiveness (how quickly to reach target)
   - Maximum SOL to use

### Advanced Strategy

The Advanced strategy provides fine-grained control:

1. Full control over all transaction parameters
2. Additional options:
   - Token action after purchase (sell or return)
   - Sell timing (after each purchase or all at once)
   - Burn small amounts option
   - Collect large amounts option

## Technical Implementation

### Transaction Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Create Maker   │────▶│  Execute Buy    │────▶│    Wait for     │
│     Wallet      │     │  Transaction    │     │     Delay       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │
│  Update Stats   │◀────│ Collect Funds   │◀────│  Execute Sell   │
│  & Metrics      │     │ (if configured) │     │  Transaction    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Randomization

To create realistic-looking trading activity, the bot randomizes:

1. Transaction amounts (within configured min/max)
2. Delay between buy and sell (50-60 seconds by default)
3. Delay between transaction cycles (configurable)

### Fallback Mechanisms

The bot includes several fallback mechanisms:

1. API endpoint fallbacks: If one Solana RPC endpoint fails, tries others
2. Simulation mode fallback: If all real endpoints fail, switches to simulation
3. Local storage for offline operation

## Data Storage

All transaction data is stored in Supabase tables:

1. `wallets`: Stores wallet addresses and balances
2. `transactions`: Records all buy/sell transactions
3. `tokens`: Tracks token information and prices

## Security Considerations

1. Private keys are never stored or transmitted
2. Wallet connections use standard wallet adapters
3. Simulation mode is enabled by default for safety
4. Real transactions require explicit configuration

## Monitoring and Analytics

The bot provides real-time metrics:

1. Number of active makers
2. Total transactions executed
3. Funds collected
4. API endpoint status
5. Token price changes

## Limitations

1. Effectiveness depends on market conditions
2. Real transactions require SOL for gas fees
3. API rate limits may affect performance
4. Market impact depends on token liquidity