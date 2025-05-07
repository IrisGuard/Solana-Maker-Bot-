import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const network = process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'mainnet-beta'
  const endpoint = process.env.EXPO_PUBLIC_SOLANA_RPC_ENDPOINTS?.split(',')[0] || 'https://api.mainnet-beta.solana.com'

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
