import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { 
  ConnectionProvider, 
  WalletProvider, 
  useWallet, 
  useConnection 
} from '@solana/wallet-adapter-react';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 
  BackpackWalletAdapter 
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Components to be used within the wallet provider context
const WalletContent = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      fetchTokens();
    } else {
      setBalance(0);
      setTokens([]);
      setSelectedTokens([]);
    }
  }, [connected, publicKey]);

  const fetchBalance = async () => {
    try {
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / 1000000000); // Convert lamports to SOL
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch SOL balance');
    }
  };

  const fetchTokens = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch all token accounts owned by the user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Process token data
      const tokenData = tokenAccounts.value.map(account => {
        const tokenInfo = account.account.data.parsed.info;
        return {
          mint: tokenInfo.mint,
          amount: tokenInfo.tokenAmount.uiAmount,
          decimals: tokenInfo.tokenAmount.decimals,
          address: account.pubkey.toString(),
        };
      }).filter(token => token.amount > 0);

      setTokens(tokenData);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to fetch token balances');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectToken = (mint) => {
    setSelectedTokens(prev => {
      if (prev.includes(mint)) {
        return prev.filter(t => t !== mint);
      } else {
        return [...prev, mint];
      }
    });
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
      
      <div style={styles.walletButtonContainer}>
        <WalletMultiButton />
      </div>
      
      {connected ? (
        <>
          <div style={styles.walletCard}>
            <div style={styles.balanceContainer}>
              <p style={styles.balanceLabel}>SOL Balance</p>
              <p style={styles.balanceValue}>{balance.toFixed(4)}</p>
              <p style={styles.fiatValue}>≈ ${(balance * 150).toFixed(2)} USD</p>
            </div>

            <div style={styles.addressContainer}>
              <p style={styles.addressLabel}>Wallet Address</p>
              <div style={styles.addressRow}>
                <p style={styles.addressValue}>{formatAddress(publicKey.toString())}</p>
                <button 
                  style={styles.button} 
                  onClick={() => navigator.clipboard.writeText(publicKey.toString())}
                >
                  Copy
                </button>
                <button 
                  style={styles.button}
                  onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')}
                >
                  View
                </button>
              </div>
            </div>
          </div>

          <div style={styles.tokenListContainer}>
            <h2 style={styles.tokenListTitle}>Your Tokens</h2>
            {isLoading && <p style={styles.loadingText}>Loading tokens...</p>}
            {error && <p style={styles.errorText}>{error}</p>}
            
            {tokens.length > 0 ? (
              <div style={styles.tokenList}>
                {tokens.map((token, index) => (
                  <div key={token.mint} style={styles.tokenItem}>
                    <div style={styles.tokenInfo}>
                      <p style={styles.tokenMint}>{formatAddress(token.mint)}</p>
                      <p style={styles.tokenAmount}>{token.amount}</p>
                    </div>
                    <button 
                      style={selectedTokens.includes(token.mint) ? styles.buttonSelected : styles.buttonSelect}
                      onClick={() => handleSelectToken(token.mint)}
                    >
                      {selectedTokens.includes(token.mint) ? 'Selected' : 'Select for Bot'}
                    </button>
                  </div>
                ))}
              </div>
            ) : !isLoading && (
              <p style={styles.noTokensText}>No tokens found in your wallet.</p>
            )}

            {selectedTokens.length > 0 && (
              <div style={styles.selectedTokensContainer}>
                <h3 style={styles.selectedTokensTitle}>Selected Tokens for Bot</h3>
                <div style={styles.selectedTokensList}>
                  {selectedTokens.map(mint => (
                    <div key={mint} style={styles.selectedTokenItem}>
                      {formatAddress(mint)}
                      <button 
                        style={styles.removeButton}
                        onClick={() => handleSelectToken(mint)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button style={styles.saveButton}>
                  Save Bot Configuration
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={styles.connectContainer}>
          <p style={styles.connectText}>
            Connect your wallet to monitor your balance and transactions.
          </p>
        </div>
      )}

      <div style={styles.infoCard}>
        <h2 style={styles.infoTitle}>About Solana Maker Bot</h2>
        <p style={styles.infoText}>
          Create and manage automated trading bots on the Solana blockchain. 
          Monitor your portfolio, track transactions, and optimize your trading strategies.
          Select the tokens you want to include in your bot's trading strategy.
        </p>
      </div>
    </div>
  );
};

export default function Home() {
  // Setup connection
  const network = 'mainnet-beta';
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Setup wallet providers
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
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
  walletButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
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
  tokenListContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  tokenListTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  tokenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tokenItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#252525',
    borderRadius: '8px',
  },
  tokenInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  tokenMint: {
    fontSize: '14px',
    marginBottom: '4px',
  },
  tokenAmount: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  buttonSelect: {
    backgroundColor: '#9945FF',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonSelected: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loadingText: {
    textAlign: 'center',
    color: '#aaa',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  noTokensText: {
    textAlign: 'center',
    color: '#aaa',
  },
  selectedTokensContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#252525',
    borderRadius: '8px',
  },
  selectedTokensTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  selectedTokensList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px',
  },
  selectedTokenItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    width: '100%',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
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