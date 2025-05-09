import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, LedgerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletConnectionProvider = ({ children, network = WalletAdapterNetwork.Mainnet }) => {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Check local storage for custom endpoint
    let customEndpoint;
    if (typeof window !== 'undefined') {
      customEndpoint = localStorage.getItem('solana-endpoint');
    }
    
    if (customEndpoint) {
      return customEndpoint;
    }
    
    // Otherwise use the network
    if (network === WalletAdapterNetwork.Mainnet) {
      return 'https://api.mainnet-beta.solana.com';
    }
    
    return clusterApiUrl(network);
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 