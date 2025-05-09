import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getSolBalance, getTokenBalances } from '../services/solanaService';
import { getSupportedTokens } from '../services/rorkService';
import TokenTrends from '../components/TokenTrends';
import Head from 'next/head';
import Link from 'next/link';

const GreekDashboard = () => {
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Φόρτωση των δεδομένων όταν συνδέεται το πορτοφόλι
  useEffect(() => {
    const loadData = async () => {
      if (connected && publicKey) {
        setLoading(true);
        try {
          // Φόρτωση του υπολοίπου SOL
          const balance = await getSolBalance(publicKey.toString());
          setSolBalance(balance);

          // Φόρτωση των tokens
          const tokensData = await getTokenBalances(publicKey.toString());
          setTokens(tokensData);

          // Φόρτωση των υποστηριζόμενων tokens
          const { success, tokens: supportedTokensData } = await getSupportedTokens();
          if (success) {
            setSupportedTokens(supportedTokensData);
          }
        } catch (error) {
          console.error('Σφάλμα φόρτωσης δεδομένων:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [connected, publicKey]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Solana Maker Bot - Πίνακας Ελέγχου</title>
        <meta name="description" content="Πίνακας ελέγχου για το Solana Maker Bot" />
      </Head>

      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Solana Maker Bot - Πίνακας Ελέγχου</h1>
          <WalletMultiButton />
        </div>
      </header>

      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li>
            <Link href="/greek-dashboard">
              <a className="font-bold text-blue-500 hover:text-blue-700">Πίνακας Ελέγχου</a>
            </Link>
          </li>
          <li>
            <Link href="/greek-bot-control">
              <a className="text-blue-500 hover:text-blue-700">Έλεγχος Bot</a>
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
          <p>Παρακαλώ συνδέστε το πορτοφόλι σας για να δείτε το ταμπλό.</p>
        </div>
      ) : loading ? (
        <div className="text-center py-10">
          <p className="text-lg">Φόρτωση δεδομένων...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Κάρτα υπολοίπου SOL */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Υπόλοιπο SOL</h2>
            <p className="text-3xl font-bold">{solBalance.toFixed(4)} SOL</p>
          </div>

          {/* Γρήγορες ενέργειες */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Γρήγορες Ενέργειες</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/greek-bot-control">
                <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center">
                  Εκκίνηση Bot
                </a>
              </Link>
              <Link href="/settings">
                <a className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-center">
                  Ρυθμίσεις
                </a>
              </Link>
            </div>
          </div>

          {/* Τάσεις των tokens */}
          <div className="md:col-span-2">
            <TokenTrends tokens={tokens.length > 0 ? tokens : supportedTokens} />
          </div>

          {/* Λίστα tokens */}
          <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Τα Tokens Μου</h2>
            {tokens.length === 0 ? (
              <p>Δεν βρέθηκαν tokens.</p>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-3">Διεύθυνση Token</th>
                    <th className="text-right pb-3">Υπόλοιπο</th>
                    <th className="text-right pb-3">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3">{token.tokenAddress}</td>
                      <td className="text-right py-3">{token.balance}</td>
                      <td className="text-right py-3">
                        <Link href={`/greek-bot-control?token=${token.tokenAddress}`}>
                          <a className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm">
                            Maker Bot
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Υποστηριζόμενα tokens */}
          <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Υποστηριζόμενα Tokens</h2>
            {supportedTokens.length === 0 ? (
              <p>Φόρτωση υποστηριζόμενων tokens...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportedTokens.map((token, index) => (
                  <div key={index} className="border rounded p-4 text-center">
                    <p className="font-semibold">{token.symbol || 'Άγνωστο'}</p>
                    <p className="text-sm text-gray-500 truncate">{token.address}</p>
                  </div>
                ))}
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

export default GreekDashboard; 