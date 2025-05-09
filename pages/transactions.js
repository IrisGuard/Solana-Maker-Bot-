import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

export default function Transactions() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("A2Rw7x...Z23u");
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Ψευδο-δεδομένα συναλλαγών
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'buy',
      token: 'HPEPE',
      amount: 10000,
      price: 0.00001,
      value: 0.1,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 λεπτά πριν
      status: 'completed',
      txHash: '5YSP...Kj7F',
      bot: true
    },
    {
      id: 2,
      type: 'sell',
      token: 'HPEPE',
      amount: 5000,
      price: 0.000012,
      value: 0.06,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 λεπτά πριν
      status: 'completed',
      txHash: '8UJT...L2mD',
      bot: true
    },
    {
      id: 3,
      type: 'boost',
      token: 'HPEPE',
      amount: 0,
      price: 0,
      value: 0.05,
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(), // 2 ώρες πριν
      status: 'completed',
      txHash: '2KLP...X9nB',
      bot: false
    },
    {
      id: 4,
      type: 'buy',
      token: 'SOL',
      amount: 0.1,
      price: 148.5,
      value: 14.85,
      timestamp: new Date(Date.now() - 180 * 60000).toISOString(), // 3 ώρες πριν
      status: 'completed',
      txHash: '9RMT...P3qS',
      bot: false
    },
    {
      id: 5,
      type: 'sell',
      token: 'BONK',
      amount: 100000,
      price: 0.000003,
      value: 0.3,
      timestamp: new Date(Date.now() - 240 * 60000).toISOString(), // 4 ώρες πριν
      status: 'failed',
      txHash: '7FLX...J5tR',
      bot: true
    }
  ]);
  
  const connectWallet = async () => {
    setWalletConnected(true);
    setWalletAddress("A2Rw7x...Z23u");
    alert("Στην πλήρη έκδοση, εδώ θα συνδεόσασταν με το Phantom ή άλλο Solana wallet.");
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'buy') return tx.type === 'buy';
    if (activeFilter === 'sell') return tx.type === 'sell';
    if (activeFilter === 'boost') return tx.type === 'boost';
    if (activeFilter === 'bot') return tx.bot;
    if (activeFilter === 'manual') return !tx.bot;
    return true;
  });
  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTransactionTypeText = (type) => {
    switch(type) {
      case 'buy': return 'Αγορά';
      case 'sell': return 'Πώληση';
      case 'boost': return 'Ενίσχυση';
      default: return type;
    }
  };
  
  const getTxExplorerUrl = (txHash) => {
    return `https://solscan.io/tx/${txHash}`;
  };
  
  const getTransactionStats = () => {
    const stats = {
      totalTx: transactions.length,
      completed: transactions.filter(tx => tx.status === 'completed').length,
      failed: transactions.filter(tx => tx.status === 'failed').length,
      botTx: transactions.filter(tx => tx.bot).length,
      manualTx: transactions.filter(tx => !tx.bot).length,
      volume: transactions.reduce((sum, tx) => sum + tx.value, 0).toFixed(2)
    };
    
    return stats;
  };
  
  const stats = getTransactionStats();

  return (
    <div className={styles.container}>
      <Head>
        <title>Συναλλαγές | Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot Transactions" />
      </Head>
      
      <header className={styles.header}>
        <h1>Συναλλαγές</h1>
      </header>
      
      <main className={styles.main}>
        {/* Wallet Connect */}
        <div className={styles.walletContainer}>
          <div className={styles.walletInfo}>
            {walletConnected ? (
              <>
                <div className={styles.walletAddress}>
                  <span className={styles.addressLabel}>Διεύθυνση</span>
                  <span className={styles.addressValue}>{walletAddress}</span>
                </div>
              </>
            ) : (
              <div className={styles.connectPrompt}>
                <p>Συνδέστε το πορτοφόλι σας για να δείτε τις συναλλαγές σας</p>
                <button 
                  className={styles.connectButton}
                  onClick={connectWallet}
                >
                  Σύνδεση Wallet
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction Stats */}
        {walletConnected && (
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Σύνολο Συναλλαγών</span>
              <span className={styles.statValue}>{stats.totalTx}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Επιτυχημένες</span>
              <span className={styles.statValue}>{stats.completed}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Αποτυχημένες</span>
              <span className={styles.statValue}>{stats.failed}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Συναλλαγές Bot</span>
              <span className={styles.statValue}>{stats.botTx}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Χειροκίνητες</span>
              <span className={styles.statValue}>{stats.manualTx}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Όγκος</span>
              <span className={styles.statValue}>${stats.volume}</span>
            </div>
          </div>
        )}
        
        {/* Transactions List */}
        {walletConnected ? (
          <div className={styles.transactionsContainer}>
            <div className={styles.filtersContainer}>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Όλες
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'buy' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('buy')}
              >
                Αγορές
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'sell' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('sell')}
              >
                Πωλήσεις
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'boost' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('boost')}
              >
                Ενισχύσεις
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'bot' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('bot')}
              >
                Bot
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'manual' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('manual')}
              >
                Χειροκίνητες
              </button>
            </div>
            
            <div className={styles.transactionList}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <div 
                    key={tx.id} 
                    className={`${styles.transactionItem} ${tx.status === 'failed' ? styles.failedTx : ''}`}
                  >
                    <div className={styles.txHeader}>
                      <div className={`${styles.txType} ${styles[tx.type]}`}>
                        {getTransactionTypeText(tx.type)}
                      </div>
                      <div className={styles.txTime}>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                    
                    <div className={styles.txDetails}>
                      <div className={styles.txDetail}>
                        <span className={styles.txLabel}>Token</span>
                        <span className={styles.txValue}>{tx.token}</span>
                      </div>
                      
                      {tx.type !== 'boost' && (
                        <>
                          <div className={styles.txDetail}>
                            <span className={styles.txLabel}>Ποσότητα</span>
                            <span className={styles.txValue}>{tx.amount.toLocaleString()}</span>
                          </div>
                          
                          <div className={styles.txDetail}>
                            <span className={styles.txLabel}>Τιμή</span>
                            <span className={styles.txValue}>${tx.price.toFixed(8)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className={styles.txDetail}>
                        <span className={styles.txLabel}>Αξία</span>
                        <span className={styles.txValue}>${tx.value.toFixed(2)}</span>
                      </div>
                      
                      <div className={styles.txDetail}>
                        <span className={styles.txLabel}>Τύπος</span>
                        <span className={styles.txValue}>{tx.bot ? 'Bot' : 'Χειροκίνητη'}</span>
                      </div>
                      
                      <div className={styles.txDetail}>
                        <span className={styles.txLabel}>Κατάσταση</span>
                        <span className={`${styles.txStatus} ${styles[tx.status]}`}>
                          {tx.status === 'completed' ? 'Ολοκληρώθηκε' : 'Απέτυχε'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.txFooter}>
                      <a 
                        href={getTxExplorerUrl(tx.txHash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.txHashLink}
                      >
                        {tx.txHash} 🔗
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noTransactions}>
                  Δεν βρέθηκαν συναλλαγές με τα επιλεγμένα φίλτρα.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.warningBanner}>
            Συνδέστε το πορτοφόλι σας για να δείτε τις συναλλαγές σας
          </div>
        )}
        
        {/* Transactions Information */}
        <div className={styles.infoCard}>
          <h3>Πληροφορίες Συναλλαγών</h3>
          <p>
            Παρακολουθήστε το ιστορικό των συναλλαγών σας στο blockchain του Solana.
          </p>
          <p>
            Οι συναλλαγές που πραγματοποιήθηκαν από το bot επισημαίνονται ξεχωριστά από τις χειροκίνητες συναλλαγές.
          </p>
          <p>
            Μπορείτε να δείτε περισσότερες λεπτομέρειες για κάθε συναλλαγή μέσω του Solana Explorer.
          </p>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <nav className={styles.bottomNav}>
          <button className={styles.navButton} onClick={() => router.push('/')}>
            <span className={styles.navIcon}>🏠</span>
            Dashboard
          </button>
          
          <button className={styles.navButton} onClick={() => router.push('/bot-control')}>
            <span className={styles.navIcon}>⚙️</span>
            Bot Control
          </button>
          
          <button className={styles.navButton} onClick={() => router.push('/tokens')}>
            <span className={styles.navIcon}>💰</span>
            Tokens
          </button>
          
          <button className={`${styles.navButton} ${styles.activeNav}`}>
            <span className={styles.navIcon}>📊</span>
            Transactions
          </button>
          
          <button className={styles.navButton} onClick={() => router.push('/settings')}>
            <span className={styles.navIcon}>⚙️</span>
            Settings
          </button>
        </nav>
      </footer>
    </div>
  );
} 