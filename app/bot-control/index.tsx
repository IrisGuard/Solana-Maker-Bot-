// app/bot-control/index.tsx
import { useState } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { getJupiterQuote, executeSwap } from "../../utils/jupiter";
import { generateWallet, saveWallet } from "../../utils/walletFactory";

export default function BotControl() {
  const [isTrading, setIsTrading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  
  // Initialize Solana connection
  const connection = new Connection(
    process.env.EXPO_PUBLIC_SOLANA_RPC_ENDPOINT!, 
    "confirmed"
  );

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };

  const startTrading = async () => {
    try {
      setIsTrading(true);
      addLog("🚀 Starting trading process...");
      setStatus("Initializing...");

      // 1. Create and save wallet
      setStatus("Creating wallet...");
      const wallet = generateWallet();
      addLog(`💰 Wallet created: ${wallet.publicKey.toString()}`);
      
      setStatus("Saving wallet...");
      await saveWallet(wallet);
      addLog("💾 Wallet saved to Supabase");

      // 2. Get Jupiter quote
      setStatus("Fetching quote...");
      const quote = await getJupiterQuote(
        "So11111111111111111111111111111111111111112", // SOL
        "8PZn1LKTfJSBgnDb4JzhMD9DdvhnE9GA61dKwZr5YUTE", // HPEPE
        100_000_000 // 0.1 SOL in lamports
      );

      if (!quote) throw new Error("❌ No valid quote received");
      addLog(`📊 Best quote: ${quote.outAmount} HPEPE`);

      // 3. Execute swap
      setStatus("Executing swap...");
      addLog("📨 Sending transaction...");
      
      const txid = await executeSwap(
        quote.swapTransaction,
        connection,
        wallet
      );
      
      addLog(`✅ Swap successful! TX: ${txid}`);
      addLog(`🔗 View transaction: https://solscan.io/tx/${txid}`);
      setStatus("🎉 Swap completed!");

    } catch (error: any) {
      addLog(`🔥 Error: ${error.message}`);
      console.error("Trading error:", error);
      setStatus("❌ Failed - check logs");
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={startTrading} 
          disabled={isTrading}
          className={`px-6 py-3 rounded-lg font-bold text-white ${
            isTrading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-500 hover:bg-green-600"
          } transition-colors`}
        >
          {isTrading ? "⚡ Trading in progress..." : "🚀 Start Trading Bot"}
        </button>
        <p className="mt-3 text-sm text-gray-500">Status: {status}</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-3">📜 Trading Logs</h3>
        <div className="space-y-2 h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div 
              key={index}
              className={`p-2 rounded text-sm font-mono ${
                log.includes("✅") ? "bg-green-50 text-green-700" :
                log.includes("❌") ? "bg-red-50 text-red-700" :
                "bg-gray-50 text-gray-600"
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
