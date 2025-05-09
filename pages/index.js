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
    <div className="container mx-auto px-4 py-12">
      <Head>
        <title>Solana Maker Bot</title>
        <meta name="description" content="Solana Maker Bot για διαχείριση συναλλαγών στο Solana blockchain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Καλώς Ήρθατε στο Solana Maker Bot
        </h1>

        <p className="text-xl mb-8 text-center max-w-2xl">
          Διαχειριστείτε τις συναλλαγές σας στο Solana blockchain και δημιουργήστε 
          αυτοματοποιημένες maker συναλλαγές για τα tokens σας.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Ελληνική Έκδοση</h2>
            <p className="mb-6 text-center">
              Χρησιμοποιήστε την εφαρμογή με ελληνικό περιβάλλον χρήστη.
            </p>
            <Link href="/greek-dashboard">
              <a className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold">
                Είσοδος στην Ελληνική Έκδοση
              </a>
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">English Version</h2>
            <p className="mb-6 text-center">
              Use the application with English user interface.
            </p>
            <Link href="/dashboard">
              <a className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold">
                Enter English Version
              </a>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Γρήγορη Πρόσβαση / Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Ελληνικά</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/greek-dashboard">
                    <a className="text-blue-500 hover:text-blue-700">▶ Πίνακας Ελέγχου</a>
                  </Link>
                </li>
                <li>
                  <Link href="/greek-bot-control">
                    <a className="text-blue-500 hover:text-blue-700">▶ Έλεγχος Bot</a>
                  </Link>
                </li>
                <li>
                  <Link href="/settings">
                    <a className="text-blue-500 hover:text-blue-700">▶ Ρυθμίσεις</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">English</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard">
                    <a className="text-blue-500 hover:text-blue-700">▶ Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/bot-control">
                    <a className="text-blue-500 hover:text-blue-700">▶ Bot Control</a>
                  </Link>
                </li>
                <li>
                  <Link href="/settings">
                    <a className="text-blue-500 hover:text-blue-700">▶ Settings</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; 2024 Solana Maker Bot. Με επιφύλαξη παντός δικαιώματος.</p>
      </footer>
    </div>
  );
} 