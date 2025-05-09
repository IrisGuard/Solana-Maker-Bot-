import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

export default function Settings() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("A2Rw7x...Z23u");
  
  // Ρυθμίσεις εφαρμογής
  const [settings, setSettings] = useState({
    // Γενικές ρυθμίσεις
    simulationMode: true,
    darkMode: true,
    language: 'el',
    
    // Ρυθμίσεις Bot
    maxTransactionsPerDay: 100,
    minDelay: 5,
    maxDelay: 10,
    autoBoost: false,
    
    // Ρυθμίσεις API
    apiEndpoint: 'https://api.mainnet-beta.solana.com',
    apiKey: '',
    
    // Ρυθμίσεις ασφάλειας
    confirmTransactions: true,
    transactionLimit: 1.0, // SOL
    notifications: true
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const connectWallet = async () => {
    setWalletConnected(true);
    setWalletAddress("A2Rw7x...Z23u");
    alert("Στην πλήρη έκδοση, εδώ θα συνδεόσασταν με το Phantom ή άλλο Solana wallet.");
  };
  
  const handleChange = (section, setting, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: value
    }));
  };
  
  const saveSettings = () => {
    // Εδώ θα αποθηκεύονταν οι ρυθμίσεις σε κάποιο API ή local storage
    alert("Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!");
  };
  
  const resetSettings = () => {
    // Επαναφορά στις προεπιλεγμένες ρυθμίσεις
    setSettings({
      simulationMode: true,
      darkMode: true,
      language: 'el',
      maxTransactionsPerDay: 100,
      minDelay: 5,
      maxDelay: 10,
      autoBoost: false,
      apiEndpoint: 'https://api.mainnet-beta.solana.com',
      apiKey: '',
      confirmTransactions: true,
      transactionLimit: 1.0,
      notifications: true
    });
    
    setShowResetConfirm(false);
    alert("Οι ρυθμίσεις επαναφέρθηκαν στις προεπιλεγμένες τιμές.");
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
                  <div className={`${styles.toggle} ${settings.simulationMode ? styles.toggleActive : ''}`} onClick={() => handleChange('general', 'simulationMode', !settings.simulationMode)}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Σκούρο Θέμα</span>
                    <span className={styles.settingDesc}>Εμφάνιση της εφαρμογής με σκούρα χρώματα</span>
                  </div>
                  <div className={`${styles.toggle} ${settings.darkMode ? styles.toggleActive : ''}`} onClick={() => handleChange('general', 'darkMode', !settings.darkMode)}>
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
                      value={settings.language}
                      onChange={(e) => handleChange('general', 'language', e.target.value)}
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
                      value={settings.maxTransactionsPerDay}
                      onChange={(e) => handleChange('bot', 'maxTransactionsPerDay', parseInt(e.target.value))}
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
                      value={settings.minDelay}
                      onChange={(e) => handleChange('bot', 'minDelay', parseInt(e.target.value))}
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
                      min="1" 
                      max="3600"
                      value={settings.maxDelay}
                      onChange={(e) => handleChange('bot', 'maxDelay', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Αυτόματη ενίσχυση</span>
                    <span className={styles.settingDesc}>Αυτόματη αύξηση τιμής με μικρές ενισχύσεις</span>
                  </div>
                  <div className={`${styles.toggle} ${settings.autoBoost ? styles.toggleActive : ''}`} onClick={() => handleChange('bot', 'autoBoost', !settings.autoBoost)}>
                    <div className={styles.toggleHandle}></div>
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
                      value={settings.apiEndpoint}
                      onChange={(e) => handleChange('api', 'apiEndpoint', e.target.value)}
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
                      value={settings.apiKey}
                      onChange={(e) => handleChange('api', 'apiKey', e.target.value)}
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
                  <div className={`${styles.toggle} ${settings.confirmTransactions ? styles.toggleActive : ''}`} onClick={() => handleChange('security', 'confirmTransactions', !settings.confirmTransactions)}>
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
                      value={settings.transactionLimit}
                      onChange={(e) => handleChange('security', 'transactionLimit', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingLabel}>
                    <span>Ειδοποιήσεις</span>
                    <span className={styles.settingDesc}>Λήψη ειδοποιήσεων για τις συναλλαγές και τη λειτουργία του bot</span>
                  </div>
                  <div className={`${styles.toggle} ${settings.notifications ? styles.toggleActive : ''}`} onClick={() => handleChange('security', 'notifications', !settings.notifications)}>
                    <div className={styles.toggleHandle}></div>
                  </div>
                </div>
                
                <div className={styles.settingNote}>
                  <p className={styles.securityNote}>⚠️ Προσοχή: Απενεργοποιώντας τις επιβεβαιώσεις συναλλαγών ή αυξάνοντας το όριο συναλλαγών, αυξάνεται ο κίνδυνος απώλειας κεφαλαίων.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.settingsActions}>
            <button 
              className={`${styles.button} ${styles.dangerButton}`}
              onClick={() => setShowResetConfirm(true)}
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
          
          {showResetConfirm && (
            <div className={styles.confirmationModal}>
              <div className={styles.confirmationContent}>
                <h3>Επιβεβαίωση Επαναφοράς</h3>
                <p>Είστε βέβαιοι ότι θέλετε να επαναφέρετε όλες τις ρυθμίσεις στις προεπιλεγμένες τιμές; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
                <div className={styles.confirmationActions}>
                  <button 
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Ακύρωση
                  </button>
                  
                  <button 
                    className={`${styles.button} ${styles.dangerButton}`}
                    onClick={resetSettings}
                  >
                    Επαναφορά
                  </button>
                </div>
              </div>
            </div>
          )}
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