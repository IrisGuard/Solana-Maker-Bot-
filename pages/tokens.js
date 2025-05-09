import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

export default function Tokens() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("A2Rw7x...Z23u");
  const [tokens, setTokens] = useState([
    { 
      id: 1, 
      symbol: 'SOL', 
      name: 'Solana', 
      balance: 0.0000,
      price: 150.00,
      change: 2.75, 
      value: 0.00 
    },
    { 
      id: 2, 
      symbol: 'HPEPE', 
      name: 'Hellenic Pepe', 
      balance: 0,
      price: 0.00001,
      change: 5.25, 
      value: 0.00 
    },
    { 
      id: 3, 
      symbol: 'BONK', 
      name: 'Bonk', 
      balance: 0,
      price: 0.000003,
      change: -1.15, 
      value: 0.00 
    }
  ]);
  
  const [showAddToken, setShowAddToken] = useState(false);
  const [newToken, setNewToken] = useState({
    symbol: '',
    name: '',
    contractAddress: ''
  });
  
  const connectWallet = async () => {
    setWalletConnected(true);
    setWalletAddress("A2Rw7x...Z23u");
    
    // Ενημέρωση υπολοίπων
    setTokens(tokens.map(token => {
      if(token.symbol === 'SOL') {
        token.balance = 0.5723;
        token.value = token.balance * token.price;
      } else if(token.symbol === 'HPEPE') {
        token.balance = 100000;
        token.value = token.balance * token.price;
      } else if(token.symbol === 'BONK') {
        token.balance = 250000;
        token.value = token.balance * token.price;
      }
      return token;
    }));
    
    alert("Στην πλήρη έκδοση, εδώ θα συνδεόσασταν με το Phantom ή άλλο Solana wallet.");
  };
  
  const handleAddToken = () => {
    if (!newToken.symbol || !newToken.name) {
      alert("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.");
      return;
    }
    
    const tokenId = tokens.length + 1;
    setTokens([
      ...tokens,
      {
        id: tokenId,
        symbol: newToken.symbol.toUpperCase(),
        name: newToken.name,
        balance: 0,
        price: 0.0,
        change: 0.0,
        value: 0.0
      }
    ]);
    
    setNewToken({
      symbol: '',
      name: '',
      contractAddress: ''
    });
    
    setShowAddToken(false);
  };
  
  const getTotalValue = () => {
    return tokens.reduce((total, token) => total + token.value, 0).toFixed(2);
  };
  
  const formatPrice = (price) => {
    if (price >= 1) {
      return price.toFixed(2);
    } else if (price >= 0.0001) {
      return price.toFixed(6);
    } else {
      return price.toFixed(8);
    }
  };
  
  const formatBalance = (balance) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + 'M';
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + 'K';
    } else if (balance >= 1) {
      return balance.toFixed(2);
    } else {
      return balance.toFixed(4);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Tokens | Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot Tokens" />
      </Head>
      
      <header className={styles.header}>
        <h1>Tokens</h1>
      </header>
      
      <main className={styles.main}>
        {/* Wallet Connect */}
        <div className={styles.walletContainer}>
          <div className={styles.walletInfo}>
            {walletConnected ? (
              <>
                <div className={styles.walletBalances}>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceLabel}>Συνολική Αξία</span>
                    <span className={styles.balanceValue}>${getTotalValue()}</span>
                  </div>
                  <div className={styles.balanceItem}>
                    <span className={styles.addressLabel}>Διεύθυνση</span>
                    <span className={styles.addressValue}>{walletAddress}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.connectPrompt}>
                <p>Συνδέστε το πορτοφόλι σας για να δείτε τα tokens σας</p>
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
        
        {/* Tokens List */}
        <div className={styles.tokenListContainer}>
          <div className={styles.tokenListHeader}>
            <h2>Τα Tokens Μου</h2>
            <button 
              className={styles.addTokenButton}
              onClick={() => setShowAddToken(!showAddToken)}
            >
              {showAddToken ? 'Ακύρωση' : '+ Προσθήκη Token'}
            </button>
          </div>
          
          {showAddToken && (
            <div className={styles.addTokenForm}>
              <div className={styles.formGroup}>
                <label>Σύμβολο Token *</label>
                <input 
                  type="text" 
                  placeholder="π.χ. SOL" 
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({...newToken, symbol: e.target.value})}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Όνομα Token *</label>
                <input 
                  type="text" 
                  placeholder="π.χ. Solana" 
                  value={newToken.name}
                  onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Διεύθυνση Contract (προαιρετικό)</label>
                <input 
                  type="text" 
                  placeholder="Διεύθυνση του token contract" 
                  value={newToken.contractAddress}
                  onChange={(e) => setNewToken({...newToken, contractAddress: e.target.value})}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.buttonRow}>
                <button 
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => setShowAddToken(false)}
                >
                  Ακύρωση
                </button>
                
                <button 
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={handleAddToken}
                >
                  Προσθήκη
                </button>
              </div>
            </div>
          )}
          
          {walletConnected ? (
            <div className={styles.tokenTableContainer}>
              <table className={styles.tokenTable}>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Τιμή</th>
                    <th>Μεταβολή 24ώρου</th>
                    <th>Υπόλοιπο</th>
                    <th>Αξία</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(token => (
                    <tr key={token.id}>
                      <td className={styles.tokenCell}>
                        <div className={styles.tokenInfo}>
                          <span className={styles.tokenSymbol}>{token.symbol}</span>
                          <span className={styles.tokenName}>{token.name}</span>
                        </div>
                      </td>
                      <td>${formatPrice(token.price)}</td>
                      <td className={token.change >= 0 ? styles.positiveChange : styles.negativeChange}>
                        {token.change > 0 ? '+' : ''}{token.change}%
                      </td>
                      <td>{formatBalance(token.balance)}</td>
                      <td>${token.value.toFixed(2)}</td>
                      <td>
                        <div className={styles.tokenActions}>
                          <button className={styles.tokenAction} title="Αγορά">🔄</button>
                          <button className={styles.tokenAction} title="Πληροφορίες">ℹ️</button>
                          <button className={styles.tokenAction} title="Ρυθμίσεις">⚙️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.warningBanner}>
              Συνδέστε το πορτοφόλι σας για να δείτε τα tokens σας
            </div>
          )}
        </div>
        
        {/* Token Information */}
        <div className={styles.infoCard}>
          <h3>Πληροφορίες Tokens</h3>
          <p>
            Διαχειριστείτε τα Solana tokens σας και παρακολουθήστε τις τιμές τους σε πραγματικό χρόνο.
          </p>
          <p>
            Μπορείτε να προσθέσετε νέα tokens εισάγοντας το σύμβολο και το όνομά τους.
          </p>
          <p>
            Για να χρησιμοποιήσετε ένα token με το bot, πρέπει να έχετε επαρκές υπόλοιπο στο πορτοφόλι σας.
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
          
          <button className={`${styles.navButton} ${styles.activeNav}`}>
            <span className={styles.navIcon}>💰</span>
            Tokens
          </button>
          
          <button className={styles.navButton} onClick={() => router.push('/transactions')}>
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