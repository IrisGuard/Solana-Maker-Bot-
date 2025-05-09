import React from 'react';
import '../styles/globals.css';
import { WalletConnectionProvider } from '../context/WalletConnectionProvider';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Ορίζουμε το δίκτυο ως Mainnet για την παραγωγή
const network = WalletAdapterNetwork.Mainnet;

function MyApp({ Component, pageProps }) {
  return (
    <WalletConnectionProvider network={network}>
      <Component {...pageProps} />
    </WalletConnectionProvider>
  );
}

export default MyApp; 