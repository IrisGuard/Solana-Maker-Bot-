import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import BotParamsForm from '../components/BotParamsForm';
import { getSupportedTokens } from '../services/rorkService';
import { createMakerTransactions, createBoostTransaction } from '../services/solanaService';
import { CONFIG, BOT_CONFIG } from '../services/config';
import Head from 'next/head';
import Link from 'next/link';

const GreekBotControl = () => {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState('');
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTokenList, setShowTokenList] = useState(false);

  // Ανάκτηση του επιλεγμένου token από το URL
  useEffect(() => {
    if (router.query.token) {
      setSelectedToken(router.query.token);
    }
  }, [router.query]);

  // Φόρτωση των υποστηριζόμενων tokens
  useEffect(() => {
    const loadSupportedTokens = async () => {
      setLoading(true);
      try {
        const { success, tokens } = await getSupportedTokens();
        if (success) {
          setSupportedTokens(tokens);
        } else {
          setError('Αποτυχία φόρτωσης υποστηριζόμενων tokens');
        }
      } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση των tokens:', error);
        setError('Σφάλμα κατά τη φόρτωση των tokens');
      } finally {
        setLoading(false);
      }
    };

    loadSupportedTokens();
  }, []);

  // Χειρισμός της επιλογής token
  const handleTokenSelect = (tokenAddress) => {
    setSelectedToken(tokenAddress);
    setShowTokenList(false);
    
    // Ενημέρωση του URL
    router.push(`/greek-bot-control?token=${tokenAddress}`, undefined, { shallow: true });
  };

  // Χειρισμός της εκκίνησης του bot
  const handleStartBot = async (params) => {
    setError('');
    setSuccess('');
    
    if (!connected || !publicKey) {
      setError('Παρακαλώ συνδέστε το πορτοφόλι σας πρώτα');
      return;
    }
    
    try {
      // Δημιουργία των maker συναλλαγών
      const result = await createMakerTransactions(
        publicKey, // Χρησιμοποιούμε το publicKey ως placeholder για το wallet
        params.tokenAddress,
        params.totalSolAmount,
        params.numMakers,
        params.minDelay,
        params.maxDelay
      );
      
      if (result.success) {
        setTransactions(result.transactions);
        setSuccess(`Δημιουργήθηκαν ${params.numMakers} makers επιτυχώς!`);
        
        // Αν έχει επιλεγεί επίπεδο boost και αυτόματο boost
        if (params.boostLevel !== 'none' && params.autoBoost) {
          // Βρίσκουμε το επιλεγμένο επίπεδο boost
          const selectedBoostLevel = BOT_CONFIG.BOOST_LEVELS.find(level => level.name === params.boostLevel);
          
          if (selectedBoostLevel) {
            // Υπολογίζουμε το ποσό SOL για το boost (π.χ. 10% του συνολικού ποσού)
            const boostSolAmount = params.totalSolAmount * 0.1;
            
            // Δημιουργία συναλλαγής boost
            const boostResult = await createBoostTransaction(
              publicKey, // Placeholder για το wallet
              params.tokenAddress,
              boostSolAmount
            );
            
            if (boostResult.success) {
              setSuccess(prev => `${prev} Επίσης, εφαρμόστηκε boost ${selectedBoostLevel.percent}% με ${boostSolAmount} SOL.`);
            }
          }
        }
      } else {
        setError(result.error || 'Αποτυχία δημιουργίας συναλλαγών');
      }
    } catch (error) {
      console.error('Σφάλμα κατά την εκκίνηση του bot:', error);
      setError('Σφάλμα κατά την εκκίνηση του bot: ' + error.message);
    }
  };

  // Χειρισμός της χειροκίνητης εφαρμογής boost
  const handleManualBoost = async (boostLevel) => {
    if (!connected || !publicKey || !selectedToken) {
      setError('Παρακαλώ συνδέστε το πορτοφόλι σας και επιλέξτε ένα token πρώτα');
      return;
    }
    
    try {
      // Βρίσκουμε το επιλεγμένο επίπεδο boost
      const selectedBoostLevel = BOT_CONFIG.BOOST_LEVELS.find(level => level.name === boostLevel);
      
      if (selectedBoostLevel) {
        // Υπολογίζουμε το ποσό SOL για το επίπεδο boost
        const boostSolAmount = 0.5; // Σταθερό ποσό για χειροκίνητο boost
        
        // Δημιουργία συναλλαγής boost
        const boostResult = await createBoostTransaction(
          publicKey, // Placeholder για το wallet
          selectedToken,
          boostSolAmount
        );
        
        if (boostResult.success) {
          setSuccess(`Εφαρμόστηκε boost ${selectedBoostLevel.percent}% με ${boostSolAmount} SOL.`);
        } else {
          setError(boostResult.error || 'Αποτυχία εφαρμογής boost');
        }
      }
    } catch (error) {
      console.error('Σφάλμα κατά την εφαρμογή boost:', error);
      setError('Σφάλμα κατά την εφαρμογή boost: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Solana Maker Bot - Έλεγχος Bot</title>
        <meta name="description" content="Έλεγχος του Solana Maker Bot" />
      </Head>

      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Έλεγχος Maker Bot</h1>
          <WalletMultiButton />
        </div>
      </header>

      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li>
            <Link href="/greek-dashboard">
              <a className="text-blue-500 hover:text-blue-700">Πίνακας Ελέγχου</a>
            </Link>
          </li>
          <li>
            <Link href="/greek-bot-control">
              <a className="font-bold text-blue-500 hover:text-blue-700">Έλεγχος Bot</a>
            </Link>
          </li>
          <li>
            <Link href="/transactions">
              <a className="text-blue-500 hover:text-blue-700">Συναλλαγές</a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a className="text-blue-500 hover:text-blue-700">Ρυθμίσεις</a>
            </Link>
          </li>
        </ul>
      </nav>

      {!connected ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
          <p>Παρακαλώ συνδέστε το πορτοφόλι σας για να χρησιμοποιήσετε το bot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Αριστερή στήλη - Επιλογή Token */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Επιλογή Token</h2>
              
              {/* Επιλεγμένο Token */}
              {selectedToken && (
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <div className="font-semibold">Επιλεγμένο Token:</div>
                  <div className="font-mono text-sm truncate">{selectedToken}</div>
                </div>
              )}
              
              {/* Κουμπί εμφάνισης λίστας tokens */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                onClick={() => setShowTokenList(!showTokenList)}
              >
                {showTokenList ? 'Απόκρυψη Λίστας' : 'Εμφάνιση Λίστας Tokens'}
              </button>
              
              {/* Λίστα tokens */}
              {showTokenList && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {loading ? (
                    <p className="text-center py-4">Φόρτωση tokens...</p>
                  ) : supportedTokens.length === 0 ? (
                    <p className="text-center py-4">Δεν βρέθηκαν διαθέσιμα tokens</p>
                  ) : (
                    <ul className="divide-y">
                      {supportedTokens.map((token, index) => (
                        <li 
                          key={index} 
                          className={`py-2 px-2 cursor-pointer hover:bg-gray-100 ${
                            token.address === selectedToken ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => handleTokenSelect(token.address)}
                        >
                          <div className="font-semibold">{token.symbol || 'Άγνωστο'}</div>
                          <div className="text-xs text-gray-500 truncate">{token.address}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {/* Χειροκίνητο Boost */}
              {selectedToken && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Χειροκίνητο Boost</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {BOT_CONFIG.BOOST_LEVELS.map((level, index) => (
                      <button
                        key={index}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm"
                        onClick={() => handleManualBoost(level.name)}
                      >
                        {level.name} ({level.percent}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Δεξιά στήλη - Φόρμα ρυθμίσεων και αποτελέσματα */}
          <div className="md:col-span-2">
            {/* Μηνύματα σφάλματος/επιτυχίας */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p>{success}</p>
              </div>
            )}

            {/* Φόρμα ρυθμίσεων bot */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Ρυθμίσεις Maker Bot</h2>
              <BotParamsForm
                tokenAddress={selectedToken}
                onSubmit={handleStartBot}
                simulationMode={CONFIG.SIMULATION_MODE}
              />
            </div>

            {/* Αποτελέσματα συναλλαγών */}
            {transactions.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Συναλλαγές Maker</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left pb-3">ID Συναλλαγής</th>
                        <th className="text-right pb-3">Ποσό (SOL)</th>
                        <th className="text-right pb-3">Καθυστέρηση (δευτ.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3 font-mono text-xs">
                            {tx.id.substring(0, 16)}...
                          </td>
                          <td className="text-right py-3">{tx.amount.toFixed(4)}</td>
                          <td className="text-right py-3">{tx.delay}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; 2024 Solana Maker Bot. Με επιφύλαξη παντός δικαιώματος.</p>
      </footer>
    </div>
  );
};

export default GreekBotControl; 