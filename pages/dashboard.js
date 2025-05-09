import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [botData, setBotData] = useState({
    status: 'inactive',
    simulationMode: true,
    makers: 100,
    transactions: 0
  });
  
  const [tokenData, setTokenData] = useState({
    sol: { price: 150.00, change: 2.5 },
    hpepe: { price: 0.00001, change: 5.0 }
  });
  
  // Fetch token prices
  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch('/api/token-price');
        const data = await response.json();
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    };
    
    fetchTokenPrices();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchTokenPrices, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch bot status
  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await fetch('/api/bot-status');
        const data = await response.json();
        setBotData({
          status: data.status,
          simulationMode: data.simulationMode,
          makers: data.maxTransactionsPerDay,
          transactions: data.transactionsToday
        });
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    };
    
    fetchBotStatus();
    
    // Refresh status every 10 seconds
    const interval = setInterval(fetchBotStatus, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const toggleBotStatus = async () => {
    try {
      const newStatus = botData.status === 'active' ? 'inactive' : 'active';
      const response = await fetch('/api/bot-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      setBotData({
        ...botData,
        status: data.status
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard | Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot Dashboard" />
      </Head>
      
      <header className={styles.header}>
        <h1>Solana Maker Bot</h1>
        <nav className={styles.navigation}>
          <button 
            className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'bots' ? styles.active : ''}`}
            onClick={() => setActiveTab('bots')}
          >
            Bot Control
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'tokens' ? styles.active : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </header>
      
      <main className={styles.main}>
        {activeTab === 'overview' && (
          <div className={styles.overviewContainer}>
            <div className={styles.statusCard}>
              <h2>Bot Status</h2>
              <div className={`${styles.statusBadge} ${styles[botData.status]}`}>
                {botData.status.toUpperCase()}
              </div>
              <button 
                className={`${styles.button} ${botData.status === 'active' ? styles.stopButton : styles.startButton}`}
                onClick={toggleBotStatus}
              >
                {botData.status === 'active' ? 'Stop Bot' : 'Start Bot'}
              </button>
              <div className={styles.statusMeta}>
                <div className={styles.statusMetaItem}>
                  <span>Simulation Mode:</span>
                  <span>{botData.simulationMode ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className={styles.statusMetaItem}>
                  <span>Makers:</span>
                  <span>{botData.makers}</span>
                </div>
                <div className={styles.statusMetaItem}>
                  <span>Transactions:</span>
                  <span>{botData.transactions}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.priceCards}>
              <div className={styles.priceCard}>
                <h2>Solana (SOL)</h2>
                <div className={styles.price}>${tokenData.sol.price.toFixed(2)}</div>
                <div className={`${styles.priceChange} ${+tokenData.sol.change > 0 ? styles.positive : styles.negative}`}>
                  {tokenData.sol.change > 0 ? '+' : ''}{tokenData.sol.change}%
                </div>
              </div>
              
              <div className={styles.priceCard}>
                <h2>HPEPE</h2>
                <div className={styles.price}>${tokenData.hpepe.price.toFixed(8)}</div>
                <div className={`${styles.priceChange} ${+tokenData.hpepe.change > 0 ? styles.positive : styles.negative}`}>
                  {tokenData.hpepe.change > 0 ? '+' : ''}{tokenData.hpepe.change}%
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'bots' && (
          <div className={styles.botsContainer}>
            <h2>Bot Control Panel</h2>
            <p>Configure and manage your trading bots.</p>
            
            <div className={styles.botSettings}>
              <h3>Bot Configuration</h3>
              <div className={styles.formGroup}>
                <label>Number of Makers</label>
                <input type="number" defaultValue={100} />
              </div>
              <div className={styles.formGroup}>
                <label>Min Delay (seconds)</label>
                <input type="number" defaultValue={5} />
              </div>
              <div className={styles.formGroup}>
                <label>Max Delay (seconds)</label>
                <input type="number" defaultValue={10} />
              </div>
              <div className={styles.formGroup}>
                <label>Target Price ($)</label>
                <input type="number" step="0.00000001" defaultValue={0.0001} />
              </div>
              <button className={styles.saveButton}>Save Configuration</button>
            </div>
          </div>
        )}
        
        {activeTab === 'tokens' && (
          <div className={styles.tokensContainer}>
            <h2>Token Management</h2>
            <p>Monitor and manage your Solana tokens.</p>
            
            <div className={styles.tokenList}>
              <div className={styles.tokenItem}>
                <div className={styles.tokenInfo}>
                  <span className={styles.tokenSymbol}>SOL</span>
                  <span className={styles.tokenName}>Solana</span>
                </div>
                <div className={styles.tokenPrice}>${tokenData.sol.price.toFixed(2)}</div>
              </div>
              
              <div className={styles.tokenItem}>
                <div className={styles.tokenInfo}>
                  <span className={styles.tokenSymbol}>HPEPE</span>
                  <span className={styles.tokenName}>Hellenic Pepe</span>
                </div>
                <div className={styles.tokenPrice}>${tokenData.hpepe.price.toFixed(8)}</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className={styles.settingsContainer}>
            <h2>Settings</h2>
            <p>Configure your Solana Maker Bot settings.</p>
            
            <div className={styles.settingGroup}>
              <h3>General Settings</h3>
              <div className={styles.settingItem}>
                <span>Simulation Mode</span>
                <div className={styles.toggle}>
                  <div className={`${styles.toggleSwitch} ${botData.simulationMode ? styles.active : ''}`}></div>
                </div>
              </div>
              <div className={styles.settingItem}>
                <span>Auto Boost</span>
                <div className={styles.toggle}>
                  <div className={styles.toggleSwitch}></div>
                </div>
              </div>
            </div>
            
            <div className={styles.settingGroup}>
              <h3>API Configuration</h3>
              <div className={styles.formGroup}>
                <label>Solana RPC Endpoint</label>
                <input type="text" defaultValue="https://api.mainnet-beta.solana.com" />
              </div>
              <button className={styles.saveButton}>Save Settings</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 