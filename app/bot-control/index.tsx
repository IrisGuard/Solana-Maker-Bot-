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
    process.env.EXPO_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };

  const startTrading = async () => {
    try {
      setIsTrading(true);
      addLog("Starting trading process...");
      setStatus("Initializing...");

      // 1. Create and save wallet
      setStatus("Creating wallet...");
      const wallet = generateWallet();
      addLog(`Wallet created: ${wallet.publicKey.toString()}`);
      
      setStatus("Saving wallet...");
      await saveWallet(wallet);
      addLog("Wallet saved to Supabase");

      // 2. Get Jupiter quote
      setStatus("Fetching quote...");
      const quote = await getJupiterQuote(
        "So11111111111111111111111111111111111111112", // SOL
        "8PZn1LKTfJSBgnDb4JzhMD9DdvhnE9GA61dKwZr5YUTE", // HPEPE
        100_000_000 // 0.1 SOL in lamports
      );

      if (!quote) {
        throw new Error("No valid quote received from Jupiter API");
      }
      addLog(`Best quote: ${quote.outAmount} HPEPE`);

      // 3. Execute swap
      setStatus("Executing swap...");
      addLog("Sending transaction to network...");
      
      const txid = await executeSwap(
        quote.swapTransaction,
        connection,
        wallet
      );
      
      addLog(`✅ Swap successful! Transaction ID: ${txid}`);
      addLog(`View transaction: https://solscan.io/tx/${txid}`);
      setStatus("Swap completed successfully");

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      console.error("Trading error:", error);
      setStatus("Failed - check logs");
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button 
          onClick={startTrading} 
          disabled={isTrading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isTrading ? "Trading in progress..." : "Start Trading Bot"}
        </button>
        <p className="mt-2 text-sm text-gray-600">Status: {status}</p>
      </div>

      <div className="border p-4 rounded max-h-96 overflow-y-auto">
        <h3 className="font-bold mb-2">Trading Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono p-1 even:bg-gray-50">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
