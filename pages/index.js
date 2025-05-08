import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container" style={styles.container}>
      <Head>
        <title>Solana Maker Bot</title>
        <meta name="description" content="Automated trading on Solana blockchain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 style={styles.title}>Solana Maker Bot</h1>
      
      <div style={styles.walletCard}>
        <div style={styles.balanceContainer}>
          <p style={styles.balanceLabel}>Welcome to Solana Maker Bot</p>
          <p style={styles.balanceValue}>Coming Soon</p>
          <p style={styles.fiatValue}>Our trading bot is under construction</p>
        </div>
      </div>

      <div style={styles.infoCard}>
        <h2 style={styles.infoTitle}>About Solana Maker Bot</h2>
        <p style={styles.infoText}>
          Create and manage automated trading bots on the Solana blockchain. 
          Monitor your portfolio, track transactions, and optimize your trading strategies.
        </p>
      </div>

      <div style={styles.featuresContainer}>
        <div style={styles.featureItem}>
          <h3 style={styles.featureTitle}>Automated Trading</h3>
          <p style={styles.featureText}>
            Set up custom strategies for automated trading on Solana DEXs
          </p>
        </div>
        <div style={styles.featureItem}>
          <h3 style={styles.featureTitle}>Portfolio Management</h3>
          <p style={styles.featureText}>
            Track and manage your crypto assets in one place
          </p>
        </div>
        <div style={styles.featureItem}>
          <h3 style={styles.featureTitle}>Analytics</h3>
          <p style={styles.featureText}>
            Get detailed insights and performance metrics
          </p>
        </div>
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
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  },
  walletCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    textAlign: 'center',
  },
  balanceContainer: {
    marginBottom: '20px',
  },
  balanceLabel: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '10px',
  },
  balanceValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#9945FF',
  },
  fiatValue: {
    fontSize: '16px',
    color: '#aaa',
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  infoText: {
    fontSize: '15px',
    color: '#ddd',
    lineHeight: '24px',
  },
  featuresContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  featureItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#9945FF',
  },
  featureText: {
    fontSize: '14px',
    color: '#ddd',
    lineHeight: '22px',
  }
}; 