import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

export default function BotControl() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("A2Rw7x...Z23u");
  const [solBalance, setSolBalance] = useState(0.0000);
  const [hpepeBalance, setHpepeBalance] = useState(0);
  const [botStatus, setBotStatus] = useState({
    status: 'inactive',
    simulationMode: true,
    requiredSol: 0.5,
    requiredHpepe: 100000,
    availableSol: 0.0000,
    availableHpepe: 0
  });
  
  const [apiStatus, setApiStatus] = useState({
    active: 3,
    total: 5
  });
  
  const [activeTab, setActiveTab] = useState('boost');
  
  // Παράμετροι boost
  const [numMakers, setNumMakers] = useState(100);
  const [hpepeAmount, setHpepeAmount] = useState(2000);
  const [solAmount, setSolAmount] = useState(0.175);
  
  // Για την ενίσχυση τιμής
  const [boostAmount, setBoostAmount] = useState(0);
  const [estimatedIncrease, setEstimatedIncrease] = useState("+0.00%");
  
  const connectWallet = async () => {
    // Προσομοίωση σύνδεσης πορτοφολιού
    setWalletConnected(true);
    setWalletAddress("A2Rw7x...Z23u");
    setSolBalance(0.0000);
    setHpepeBalance(0);
    
    // Στην πραγματική εφαρμογή, εδώ θα συνδεόσασταν με το Solana wallet
    alert("Στην πλήρη έκδοση, εδώ θα συνδεόσασταν με το Phantom ή άλλο Solana wallet.");
  };
  
  const startBot = () => {
    // Ενημέρωση κατάστασης bot
    setBotStatus({
      ...botStatus,
      status: 'active'
    });
  };
  
  const saveSettings = () => {
    // Αποθήκευση ρυθμίσεων
    alert("Οι ρυθμίσεις αποθηκεύτηκαν!");
  };
  
  const boost = () => {
    if (boostAmount > 0) {
      alert(`Η ενίσχυση με ${boostAmount} SOL ξεκίνησε!`);
    } else {
      alert("Παρακαλώ εισάγετε ποσό SOL για ενίσχυση.");
    }
  };

  // Έλεγχος εάν υπάρχουν οι απαιτούμενοι πόροι για να ξεκινήσει το bot
  const hasRequiredResources = botStatus.availableSol >= botStatus.requiredSol && 
                               botStatus.availableHpepe >= botStatus.requiredHpepe;

  return (
    <div className={styles.container}>
      <Head>
        <title>Έλεγχος Bot | Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot Control Panel" />
      </Head>
      
      <header className={styles.header}>
        <h1>Bot Control</h1>
      </header>
      
      <main className={styles.main}>
        {/* Wallet Connect */}
        <div className={styles.walletContainer}>
          <div className={styles.walletInfo}>
            {walletConnected ? (
              <>
                <div className={styles.walletBalances}>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceLabel}>SOL</span>
                    <span className={styles.balanceValue}>{solBalance.toFixed(4)}</span>
                    <span className={styles.balanceUsd}>≈ ${(solBalance * 150).toFixed(2)} USD</span>
                  </div>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceLabel}>HPEPE</span>
                    <span className={styles.balanceValue}>{hpepeBalance.toLocaleString()}</span>
                    <span className={styles.balanceUsd}>≈ ${(hpepeBalance * 0.00001).toFixed(2)} USD</span>
                  </div>
                </div>
                
                <div className={styles.walletAddress}>
                  <span className={styles.addressLabel}>Διεύθυνση</span>
                  <span className={styles.addressValue}>{walletAddress}</span>
                  <button 
                    className={styles.disconnectButton}
                    onClick={() => setWalletConnected(false)}
                    title="Αποσύνδεση"
                  >
                    ✕
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.connectPrompt}>
                <p>Συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε το bot</p>
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
        
        {/* API Status Alert */}
        <div className={styles.alertCard}>
          <div className={styles.alertHeader}>
            <span className={styles.alertIcon}>⚠️</span>
            <h3>API Status</h3>
            <button className={styles.refreshButton} title="Ανανέωση">🔄</button>
          </div>
          <div className={styles.alertContent}>
            <p>{apiStatus.active} of {apiStatus.total} endpoints active ({Math.round((apiStatus.active/apiStatus.total)*100)}%)</p>
            <p className={styles.lastChecked}>Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Bot Control Panel */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Έλεγχος Bot</h3>
            <span className={styles.sectionBadge}>Ανενεργό</span>
          </div>
          
          <div className={styles.sectionContent}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Απαιτούμενο SOL</div>
              <div className={styles.infoValue}>{botStatus.requiredSol} SOL <span className={styles.warningIcon}>⚠️</span></div>
            </div>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Απαιτούμενο HPEPE</div>
              <div className={styles.infoValue}>{botStatus.requiredHpepe.toLocaleString()} HPEPE <span className={styles.warningIcon}>⚠️</span></div>
            </div>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Διαθέσιμο SOL</div>
              <div className={styles.infoValue}>{botStatus.availableSol} SOL</div>
            </div>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Διαθέσιμο HPEPE</div>
              <div className={styles.infoValue}>{botStatus.availableHpepe} HPEPE</div>
            </div>
          </div>
          
          <div className={styles.simulationBanner}>
            Λειτουργία Προσομοίωσης: Ενεργή (Δεν θα γίνουν πραγματικές συναλλαγές)
          </div>
          
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={startBot}
            disabled={!walletConnected}
          >
            Εκκίνηση Bot
          </button>
          
          {!walletConnected && (
            <div className={styles.warningBanner}>
              Συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε το bot
            </div>
          )}
        </div>
        
        {/* Bot Settings Panel */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Ρυθμίσεις Bot</h3>
            <button className={styles.settingsIcon}>⚙️</button>
          </div>
          
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'boost' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('boost')}
            >
              Boost
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'target' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('target')}
            >
              Target
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'advanced' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          </div>
          
          <div className={styles.tabContent}>
            {activeTab === 'boost' && (
              <>
                <div className={styles.formGroup}>
                  <label>Αριθμός Makers</label>
                  <input 
                    type="number" 
                    value={numMakers} 
                    onChange={(e) => setNumMakers(parseInt(e.target.value))} 
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ποσότητα HPEPE</label>
                  <input 
                    type="number" 
                    value={hpepeAmount} 
                    onChange={(e) => setHpepeAmount(parseInt(e.target.value))} 
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ποσότητα SOL</label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={solAmount} 
                    onChange={(e) => setSolAmount(parseFloat(e.target.value))} 
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.tokenOptions}>
                  <h4>Επιλογές Tokens</h4>
                  
                  <div className={styles.optionRow}>
                    <span>Ενέργεια μετά την αγορά</span>
                    <div className={styles.buttonGroup}>
                      <button className={`${styles.optionButton} ${styles.activeOption}`}>Πώληση</button>
                      <button className={styles.optionButton}>Επιστροφή</button>
                    </div>
                  </div>
                  
                  <div className={styles.optionRow}>
                    <span>Χρόνος πώλησης</span>
                    <div className={styles.buttonGroup}>
                      <button className={`${styles.optionButton} ${styles.activeOption}`}>Κάθε αγορά</button>
                      <button className={styles.optionButton}>Όλες μαζί</button>
                    </div>
                  </div>
                  
                  <div className={styles.toggleRow}>
                    <span>"Κάψιμο" μικρών ποσών</span>
                    <div className={`${styles.toggle} ${true ? styles.toggleActive : ''}`}>
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                  
                  <div className={styles.toggleRow}>
                    <span>Συλλογή μεγάλων ποσών</span>
                    <div className={`${styles.toggle} ${true ? styles.toggleActive : ''}`}>
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                  
                  <div className={styles.toggleRow}>
                    <span>Αυτόματη ενίσχυση</span>
                    <div className={`${styles.toggle} ${false ? styles.toggleActive : ''}`}>
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'target' && (
              <div className={styles.tabContent}>
                <p>Ρυθμίσεις στόχου τιμής...</p>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className={styles.tabContent}>
                <p>Προχωρημένες ρυθμίσεις...</p>
              </div>
            )}
          </div>
          
          <div className={styles.buttonRow}>
            <button 
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => {
                // Επαναφορά στις προεπιλεγμένες ρυθμίσεις
                setNumMakers(100);
                setHpepeAmount(2000);
                setSolAmount(0.175);
              }}
            >
              Επαναφορά
            </button>
            
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={saveSettings}
            >
              Αποθήκευση
            </button>
          </div>
        </div>
        
        {/* Price Boost Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Ενίσχυση Τιμής</h3>
            <span className={styles.chartIcon}>📈</span>
          </div>
          
          <div className={styles.sectionContent}>
            <p className={styles.boostDescription}>
              Χρησιμοποιήστε αυτή τη λειτουργία για να ενισχύσετε χειροκίνητα την τιμή του token.
            </p>
            
            <div className={styles.formGroup}>
              <label>Ποσό SOL για ενίσχυση</label>
              <input 
                type="number" 
                step="0.01"
                value={boostAmount} 
                onChange={(e) => {
                  const amount = parseFloat(e.target.value);
                  setBoostAmount(amount);
                  // Υπολογισμός εκτιμώμενης αύξησης
                  const increase = amount > 0 ? (amount * 0.5).toFixed(2) : 0;
                  setEstimatedIncrease(`+${increase}%`);
                }} 
                className={styles.input}
              />
            </div>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Διαθέσιμο SOL</div>
              <div className={styles.infoValue}>{botStatus.availableSol} SOL</div>
            </div>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Εκτιμώμενη Αύξηση</div>
              <div className={styles.infoValuePositive}>{estimatedIncrease}</div>
            </div>
          </div>
          
          <button 
            className={`${styles.button} ${styles.boostButton}`}
            onClick={boost}
            disabled={!walletConnected}
          >
            Ενίσχυση Τώρα
          </button>
          
          {!walletConnected && (
            <div className={styles.warningBanner}>
              Συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε αυτή τη λειτουργία
            </div>
          )}
        </div>
        
        {/* Bot Information */}
        <div className={styles.infoCard}>
          <h3>Bot Information</h3>
          <p>
            The Solana Maker Bot uses advanced algorithms to increase token price through strategic transactions on the Solana blockchain.
          </p>
          <p>
            For best results, it is recommended to have at least 0.5 SOL and 100,000 tokens in your wallet.
          </p>
          <p>
            The bot operates in simulation mode by default and does not perform real transactions unless you disable simulation mode in settings.
          </p>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <nav className={styles.bottomNav}>
          <button className={styles.navButton} onClick={() => router.push('/')}>
            <span className={styles.navIcon}>🏠</span>
            Dashboard
          </button>
          
          <button className={`${styles.navButton} ${styles.activeNav}`}>
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
          
          <button className={styles.navButton} onClick={() => router.push('/settings')}>
            <span className={styles.navIcon}>⚙️</span>
            Settings
          </button>
        </nav>
      </footer>
    </div>
  );
} 