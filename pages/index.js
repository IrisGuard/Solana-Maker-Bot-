import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [solanaPrice, setSolanaPrice] = useState(150.0);
  const [hpepePrice, setHpepePrice] = useState(0.00001);
  const [botStatus, setBotStatus] = useState('inactive');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate random prices
        setSolanaPrice(150 + (Math.random() * 10 - 5));
        setHpepePrice(0.00001 + (Math.random() * 0.000005));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleBotStatus = () => {
    setBotStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Solana Maker Bot</title>
        <meta name="description" content="Automated trading on Solana blockchain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Solana Maker Bot
        </h1>

        <div className={styles.statusContainer}>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>Bot Status</div>
            <div className={`${styles.statusValue} ${styles[botStatus]}`}>
              {botStatus.toUpperCase()}
            </div>
            <button 
              className={`${styles.button} ${botStatus === 'active' ? styles.stopButton : styles.startButton}`}
              onClick={toggleBotStatus}
            >
              {botStatus === 'active' ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Solana Price</h2>
            <p className={styles.priceValue}>${solanaPrice.toFixed(2)}</p>
          </div>

          <div className={styles.card}>
            <h2>HPEPE Price</h2>
            <p className={styles.priceValue}>${hpepePrice.toFixed(8)}</p>
          </div>

          <div className={styles.card}>
            <h2>Maker Configuration</h2>
            <p>Number of makers: 100</p>
            <p>Min delay: 5 seconds</p>
            <p>Max delay: 10 seconds</p>
          </div>

          <div className={styles.card}>
            <h2>Simulation Mode</h2>
            <div className={styles.toggleContainer}>
              <span>Enabled</span>
              <div className={styles.toggle}>
                <div className={styles.toggleButton}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Solana Maker Bot - Automated Trading</p>
      </footer>
    </div>
  );
} 