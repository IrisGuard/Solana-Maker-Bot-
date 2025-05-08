import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [address, setAddress] = useState('');
  const [solBalance, setSolBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Mock connect wallet for now - will be replaced with actual Solana wallet
  const connectWallet = () => {
    const mockAddress = '8YLKoCu4MWYDZrYLxM1NLwXBS8joipeRJmrqZ13SVqdx';
    setAddress(mockAddress);
    setSolBalance(1.234);
    setIsConnected(true);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="container" style={styles.container}>
      <Head>
        <title>Solana Maker Bot</title>
        <meta name="description" content="Automated trading on Solana blockchain" />
      </Head>

      <h1 style={styles.title}>Solana Maker Bot</h1>
      
      {isConnected ? (
        <div style={styles.walletCard}>
          <div style={styles.balanceContainer}>
            <p style={styles.balanceLabel}>SOL Balance</p>
            <p style={styles.balanceValue}>{solBalance.toFixed(4)}</p>
            <p style={styles.fiatValue}>≈ ${(solBalance * 150).toFixed(2)} USD</p>
          </div>

          <div style={styles.addressContainer}>
            <p style={styles.addressLabel}>Wallet Address</p>
            <div style={styles.addressRow}>
              <p style={styles.addressValue}>{formatAddress(address)}</p>
              <button style={styles.button} onClick={() => navigator.clipboard.writeText(address)}>
                Copy
              </button>
              <button 
                style={styles.button}
                onClick={() => window.open(`https://explorer.solana.com/address/${address}`, '_blank')}
              >
                View
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.connectContainer}>
          <p style={styles.connectText}>
            Connect your wallet to monitor your balance and transactions.
          </p>
          <button style={styles.connectButton} onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      )}

      <div style={styles.infoCard}>
        <h2 style={styles.infoTitle}>About Solana Maker Bot</h2>
        <p style={styles.infoText}>
          Create and manage automated trading bots on the Solana blockchain. 
          Monitor your portfolio, track transactions, and optimize your trading strategies.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#121212',
    color: '#fff',
    minHeight: '100vh',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  walletCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  balanceContainer: {
    marginBottom: '20px',
  },
  balanceLabel: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '5px',
  },
  balanceValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  fiatValue: {
    fontSize: '16px',
    color: '#aaa',
  },
  addressContainer: {
    marginBottom: '20px',
  },
  addressLabel: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '5px',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'center',
  },
  addressValue: {
    fontSize: '16px',
    flex: 1,
  },
  button: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    marginLeft: '8px',
    cursor: 'pointer',
  },
  connectContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  connectText: {
    fontSize: '16px',
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '20px',
  },
  connectButton: {
    backgroundColor: '#9945FF',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  infoText: {
    fontSize: '14px',
    color: '#aaa',
    lineHeight: '22px',
  },
}; 