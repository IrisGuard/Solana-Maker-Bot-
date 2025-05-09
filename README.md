# Solana Maker Bot

Automate your Solana trading with Solana Maker Bot. Create, manage, and monitor trading bots on the Solana blockchain.

## Features

- Automated trading bot creation
- Real-time monitoring of bot performance
- Multiple wallet support
- Simulation mode for testing strategies
- Transaction history and analytics

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

For deployment instructions and troubleshooting, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

Key points:
- Use React 17.0.2 with Next.js 12.3.4 for compatibility
- Follow Dependabot configuration in `.github/dependabot.yml`

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `EXPO_PUBLIC_SOLANA_RPC_ENDPOINTS`: Solana RPC endpoints
- `EXPO_PUBLIC_JUPITER_API_KEY`: Jupiter API key
- `EXPO_PUBLIC_COINGECKO_API_KEY`: CoinGecko API key
- `EXPO_PUBLIC_ENABLE_REAL_TRANSACTIONS`: Enable real transactions
- `EXPO_PUBLIC_SIMULATION_MODE`: Enable simulation mode

## License

This project is licensed under the MIT License - see the LICENSE file for details.
