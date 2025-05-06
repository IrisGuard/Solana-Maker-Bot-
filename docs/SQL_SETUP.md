# Supabase SQL Setup for HPEPE Bot

This document provides the SQL setup instructions for creating the necessary tables in Supabase for the HPEPE Bot application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key for configuration

## Table Schemas

### 1. Wallets Table

This table stores wallet addresses and their balances.

```sql
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  provider TEXT,
  sol_balance FLOAT,
  hpepe_balance FLOAT,
  last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by address
CREATE INDEX IF NOT EXISTS wallets_address_idx ON wallets (address);
```

### 2. Transactions Table

This table records all transactions executed by the bot.

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL,
  amount FLOAT NOT NULL,
  currency TEXT NOT NULL,
  tokens FLOAT NOT NULL,
  token_currency TEXT NOT NULL,
  maker TEXT,
  signature TEXT,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS transactions_wallet_address_idx ON transactions (wallet_address);
CREATE INDEX IF NOT EXISTS transactions_timestamp_idx ON transactions (timestamp);
```

### 3. Tokens Table

This table tracks token information and prices.

```sql
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  address TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  balance FLOAT,
  price FLOAT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, address)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS tokens_wallet_address_idx ON tokens (wallet_address);
CREATE INDEX IF NOT EXISTS tokens_address_idx ON tokens (address);
```

## Helper Functions

These functions help with table creation and management.

```sql
-- Function to create wallets table if it doesn't exist
CREATE OR REPLACE FUNCTION create_wallets_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'wallets') THEN
    CREATE TABLE wallets (
      id SERIAL PRIMARY KEY,
      address TEXT NOT NULL UNIQUE,
      provider TEXT,
      sol_balance FLOAT,
      hpepe_balance FLOAT,
      last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX wallets_address_idx ON wallets (address);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create transactions table if it doesn't exist
CREATE OR REPLACE FUNCTION create_transactions_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'transactions') THEN
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      type TEXT NOT NULL,
      amount FLOAT NOT NULL,
      currency TEXT NOT NULL,
      tokens FLOAT NOT NULL,
      token_currency TEXT NOT NULL,
      maker TEXT,
      signature TEXT,
      status TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX transactions_wallet_address_idx ON transactions (wallet_address);
    CREATE INDEX transactions_timestamp_idx ON transactions (timestamp);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create tokens table if it doesn't exist
CREATE OR REPLACE FUNCTION create_tokens_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tokens') THEN
    CREATE TABLE tokens (
      id SERIAL PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      address TEXT NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      balance FLOAT,
      price FLOAT,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(wallet_address, address)
    );
    
    CREATE INDEX tokens_wallet_address_idx ON tokens (wallet_address);
    CREATE INDEX tokens_address_idx ON tokens (address);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to execute SQL directly (fallback)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

These policies control access to the tables.

```sql
-- Enable RLS on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets table
CREATE POLICY "Allow public read access to wallets" ON wallets
  FOR SELECT USING (true);
  
CREATE POLICY "Allow authenticated insert to wallets" ON wallets
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow authenticated update to wallets" ON wallets
  FOR UPDATE USING (true);

-- Create policies for transactions table
CREATE POLICY "Allow public read access to transactions" ON transactions
  FOR SELECT USING (true);
  
CREATE POLICY "Allow authenticated insert to transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Create policies for tokens table
CREATE POLICY "Allow public read access to tokens" ON tokens
  FOR SELECT USING (true);
  
CREATE POLICY "Allow authenticated insert to tokens" ON tokens
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow authenticated update to tokens" ON tokens
  FOR UPDATE USING (true);
```

## Setup Instructions

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the SQL code for each section
3. Execute the SQL to create the tables and functions
4. Verify the tables were created successfully

## Verification

To verify the tables were created correctly, run:

```sql
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

You should see `wallets`, `transactions`, and `tokens` in the results.

## Configuration

After setting up the tables, update your `.env` file with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

If you encounter issues with table creation:

1. Check for error messages in the SQL Editor
2. Verify you have the necessary permissions
3. Try running the individual CREATE TABLE statements separately




4. Use the fallback `execute_sql` function if needed
  
