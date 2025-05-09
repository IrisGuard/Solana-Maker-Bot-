import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from '../styles/Dashboard.module.css';
import { setApiKeys, getApiKeys } from '../services/config';

export default function Settings() {
  const router = useRouter();
  const wallet = useWallet();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("A2Rw7x...Z23u");
  
  // Κατάσταση για τις ρυθμίσεις
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('el');
  const [rpcEndpoint, setRpcEndpoint] = useState('https://api.mainnet-beta.solana.com');
  
  // Κλειδιά API
  const [rorkApiKey, setRorkApiKey] = useState('');
  const [rorkApiSecret, setRorkApiSecret] = useState('');
  const [showApiSecret, setShowApiSecret] = useState(false);
  
  // Simulation mode
  const [simulationMode, setSimulationMode] = useState(true);
  
  // Transaction settings
  const [minDelay, setMinDelay] = useState(5);
  const [maxDelay, setMaxDelay] = useState(30);
  const [transactionsPerDay, setTransactionsPerDay] = useState(100);
  const [transactionLimit, setTransactionLimit] = useState(1.0);
  
  const [activeTab, setActiveTab] = useState('general');
  
  // Φόρτωση ρυθμίσεων
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Λήψη αποθηκευμένων ρυθμίσεων
      const savedTheme = localStorage.getItem('theme') || 'dark';
      const savedLanguage = localStorage.getItem('language') || 'el';
      const savedRpcEndpoint = localStorage.getItem('rpc_endpoint') || 'https://api.mainnet-beta.solana.com';
      const savedSimulationMode = localStorage.getItem('simulation_mode') !== 'false';
      const savedMinDelay = parseInt(localStorage.getItem('min_delay') || '5');
      const savedMaxDelay = parseInt(localStorage.getItem('max_delay') || '30');
      const savedTransactionsPerDay = parseInt(localStorage.getItem('transactions_per_day') || '100');
      const savedTransactionLimit = parseFloat(localStorage.getItem('transaction_limit') || '1.0');
      
      // Ρύθμιση της κατάστασης
      setTheme(savedTheme);
      setLanguage(savedLanguage);
      setRpcEndpoint(savedRpcEndpoint);
      setSimulationMode(savedSimulationMode);
      setMinDelay(savedMinDelay);
      setMaxDelay(savedMaxDelay);
      setTransactionsPerDay(savedTransactionsPerDay);
      setTransactionLimit(savedTransactionLimit);
      
      // Λήψη κλειδιών API
      const { rorkAppKey, rorkAppSecret } = getApiKeys();
      if (rorkAppKey) setRorkApiKey(rorkAppKey);
      if (rorkAppSecret) setRorkApiSecret(rorkAppSecret);
    }
  }, []);
  
  const connectWallet = async () => {
    setWalletConnected(true);
    setWalletAddress("A2Rw7x...Z23u");
    alert("Στην πλήρη έκδοση, εδώ θα συνδεόσασταν με το Phantom ή άλλο Solana wallet.");
  };
  
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      // Αποθήκευση ρυθμίσεων
      localStorage.setItem('theme', theme);
      localStorage.setItem('language', language);
      localStorage.setItem('rpc_endpoint', rpcEndpoint);
      localStorage.setItem('simulation_mode', simulationMode.toString());
      localStorage.setItem('min_delay', minDelay.toString());
      localStorage.setItem('max_delay', maxDelay.toString());
      localStorage.setItem('transactions_per_day', transactionsPerDay.toString());
      localStorage.setItem('transaction_limit', transactionLimit.toString());
      
      // Αποθήκευση κλειδιών API
      if (rorkApiKey && rorkApiSecret) {
        setApiKeys(rorkApiKey, rorkApiSecret);
      }
      
      alert('Οι ρυθμίσεις αποθηκεύτηκαν!');
    }
  };
  
  const resetSettings = () => {
    if (confirm('Είστε βέβαιοι ότι θέλετε να επαναφέρετε τις προεπιλεγμένες ρυθμίσεις;')) {
      setTheme('dark');
      setLanguage('el');
      setRpcEndpoint('https://api.mainnet-beta.solana.com');
      setSimulationMode(true);
      setMinDelay(5);
      setMaxDelay(30);
      setTransactionsPerDay(100);
      setTransactionLimit(1.0);
      
      // Δεν επαναφέρουμε τα κλειδιά API κατά την επαναφορά
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Ρυθμίσεις | Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot Settings" />
      </Head>
      
      <header className={styles.header}>
        <h1>Ρυθμίσεις</h1>
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
                <p>Συνδέστε το πορτοφόλι σας για πρόσβαση σε όλες τις ρυθμίσεις</p>
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
        
        {/* Settings */}
        <div className={styles.settingsContainer}>
          <div className={styles.settingsTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('general')}
            >
              Γενικά
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'bot' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('bot')}
            >
              Bot
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'api' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('api')}
            >
              API
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'security' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Ασφάλεια
            </button>
          </div>
          
          <div className={styles.settingsContent}>
            {activeTab === 'general' && (
              <div className={styles.settingsSection}>
                <h2>Γενικές Ρυθμίσεις</h2>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Λειτουργία Προσομοίωσης</span>
                    <span className={styles.settingDesc}>Οι συναλλαγές δεν πραγματοποιούνται στο blockchain</span>
                  </div>
                  <div className={`${styles.toggle} ${simulationMode ? styles.toggleActive : ''}`} onClick={() => setSimulationMode(!simulationMode)}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Σκούρο Θέμα</span>
                    <span className={styles.settingDesc}>Εμφάνιση της εφαρμογής με σκούρα χρώματα</span>
                  </div>
                  <div className={`${styles.toggle} ${theme === 'dark' ? styles.toggleActive : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Γλώσσα</span>
                    <span className={styles.settingDesc}>Επιλογή γλώσσας διεπαφής</span>
                  </div>
                  <div className={styles.settingControl}>
                    <select 
                      className={styles.select}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="el">Ελληνικά</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'bot' && (
              <div className={styles.settingsSection}>
                <h2>Ρυθμίσεις Bot</h2>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Μέγιστος αριθμός συναλλαγών/ημέρα</span>
                    <span className={styles.settingDesc}>Όριο συναλλαγών που θα εκτελεί το bot ανά 24ωρο</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="number" 
                      className={styles.input}
                      min="1" 
                      max="1000"
                      value={transactionsPerDay}
                      onChange={(e) => setTransactionsPerDay(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Ελάχιστη καθυστέρηση (δευτερόλεπτα)</span>
                    <span className={styles.settingDesc}>Ελάχιστος χρόνος μεταξύ συναλλαγών</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="number" 
                      className={styles.input}
                      min="1" 
                      max="3600"
                      value={minDelay}
                      onChange={(e) => setMinDelay(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Μέγιστη καθυστέρηση (δευτερόλεπτα)</span>
                    <span className={styles.settingDesc}>Μέγιστος χρόνος μεταξύ συναλλαγών</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="number" 
                      className={styles.input}
                      min={minDelay}
                      max="3600"
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'api' && (
              <div className={styles.settingsSection}>
                <h2>Ρυθμίσεις API</h2>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Solana RPC Endpoint</span>
                    <span className={styles.settingDesc}>Διεύθυνση Solana RPC API</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="text" 
                      className={styles.input}
                      value={rpcEndpoint}
                      onChange={(e) => setRpcEndpoint(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>API Key (προαιρετικό)</span>
                    <span className={styles.settingDesc}>Κλειδί για πρόσβαση σε premium RPC endpoints</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="password" 
                      className={styles.input}
                      value={rorkApiKey}
                      onChange={(e) => setRorkApiKey(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className={styles.settingNote}>
                  <p>Σημείωση: Η χρήση premium RPC endpoints μπορεί να βελτιώσει την απόδοση και αξιοπιστία του bot.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className={styles.settingsSection}>
                <h2>Ρυθμίσεις Ασφάλειας</h2>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Επιβεβαίωση Συναλλαγών</span>
                    <span className={styles.settingDesc}>Ζήτηση επιβεβαίωσης πριν την εκτέλεση συναλλαγών</span>
                  </div>
                  <div className={`${styles.toggle} ${transactionLimit > 0 ? styles.toggleActive : ''}`} onClick={() => setTransactionLimit(transactionLimit > 0 ? 0 : 1.0)}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Όριο Συναλλαγής (SOL)</span>
                    <span className={styles.settingDesc}>Μέγιστο ποσό SOL ανά συναλλαγή</span>
                  </div>
                  <div className={styles.settingControl}>
                    <input 
                      type="number" 
                      step="0.1"
                      className={styles.input}
                      value={transactionLimit}
                      onChange={(e) => setTransactionLimit(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.settingsActions}>
            <button 
              className={`${styles.button} ${styles.dangerButton}`}
              onClick={resetSettings}
            >
              Επαναφορά Προεπιλογών
            </button>
            
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={saveSettings}
            >
              Αποθήκευση Ρυθμίσεων
            </button>
          </div>
        </div>
        
        {/* Settings Information */}
        <div className={styles.infoCard}>
          <h3>Σχετικά με τις Ρυθμίσεις</h3>
          <p>
            Προσαρμόστε τις λειτουργίες του Solana Maker Bot στις ανάγκες σας μέσω των ρυθμίσεων.
          </p>
          <p>
            Η λειτουργία προσομοίωσης σας επιτρέπει να δοκιμάσετε το bot χωρίς να πραγματοποιήσετε συναλλαγές στο blockchain.
          </p>
          <p>
            Για βέλτιστη απόδοση, συνιστούμε να χρησιμοποιείτε ένα premium Solana RPC endpoint και να διατηρείτε ενεργές τις ρυθμίσεις ασφαλείας.
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
          
          <button className={styles.navButton} onClick={() => router.push('/transactions')}>
            <span className={styles.navIcon}>📊</span>
            Transactions
          </button>
          
          <button className={`${styles.navButton} ${styles.activeNav}`}>
            <span className={styles.navIcon}>⚙️</span>
            Settings
          </button>
        </nav>
      </footer>
    </div>
  );
} 