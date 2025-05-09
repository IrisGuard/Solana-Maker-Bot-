import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
            <div className={styles.statusHeader}>Κατάσταση Bot</div>
            <div className={`${styles.statusValue} ${styles[botStatus]}`}>
              {botStatus === 'active' ? 'ΕΝΕΡΓΟ' : 'ΑΝΕΝΕΡΓΟ'}
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={`${styles.button} ${botStatus === 'active' ? styles.stopButton : styles.startButton}`}
                onClick={toggleBotStatus}
              >
                {botStatus === 'active' ? 'Διακοπή Bot' : 'Εκκίνηση Bot'}
              </button>
              
              <Link href="/bot-control">
                <a className={styles.controlButton}>Προχωρημένες Ρυθμίσεις</a>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Τιμή Solana</h2>
            <p className={styles.priceValue}>${solanaPrice.toFixed(2)}</p>
          </div>

          <div className={styles.card}>
            <h2>Τιμή HPEPE</h2>
            <p className={styles.priceValue}>${hpepePrice.toFixed(8)}</p>
          </div>

          <div className={styles.card}>
            <h2>Ρυθμίσεις Bot</h2>
            <p>Πλήθος makers: 100</p>
            <p>Ελάχιστη καθυστέρηση: 5 δευτερόλεπτα</p>
            <p>Μέγιστη καθυστέρηση: 10 δευτερόλεπτα</p>
            
            <Link href="/bot-control">
              <a className={styles.cardLink}>Επεξεργασία ρυθμίσεων →</a>
            </Link>
          </div>

          <div className={styles.card}>
            <h2>Λειτουργία Προσομοίωσης</h2>
            <div className={styles.toggleContainer}>
              <span>Ενεργή</span>
              <div className={styles.toggle}>
                <div className={styles.toggleButton}></div>
              </div>
            </div>
            <p className={styles.smallText}>
              Στη λειτουργία προσομοίωσης δεν πραγματοποιούνται πραγματικές συναλλαγές
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Solana Maker Bot - Αυτοματοποιημένες Συναλλαγές</p>
        
        <nav className={styles.footerNav}>
          <Link href="/"><a className={styles.footerLink}>Αρχική</a></Link>
          <Link href="/bot-control"><a className={styles.footerLink}>Έλεγχος Bot</a></Link>
          <Link href="/tokens"><a className={styles.footerLink}>Tokens</a></Link>
          <Link href="/transactions"><a className={styles.footerLink}>Συναλλαγές</a></Link>
        </nav>
      </footer>
    </div>
  );
} 