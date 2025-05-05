// app/bot-control/index.tsx
import { useState } from "react";
import { getJupiterQuote } from "../../utils/jupiter";
import { generateWallet, saveWallet } from "../../utils/walletFactory";

export default function BotControl() {
  const [isTrading, setIsTrading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };

  const startTrading = async () => {
    try {
      setIsTrading(true);
      addLog("Starting trading process...");

      // Wallet creation
      setStatus("Creating wallet...");
      const wallet = generateWallet();
      addLog(`Wallet created: ${wallet.publicKey.toString()}`);

      // Save wallet
      setStatus("Saving wallet...");
      await saveWallet(wallet);
      addLog("Wallet saved to Supabase");

      // Get quote
      setStatus("Fetching quote...");
      const quote = await getJupiterQuote(
        "So11111111111111111111111111111111111111112",
        "8PZn1LKTfJSBgnDb4JzhMD9DdvhnE9GA61dKwZr5YUTE",
        100_000_000
      );

      if (!quote) {
        throw new Error("No valid quote received");
      }

      addLog(`Best quote: ${quote.outAmount} HPEPE`);
      setStatus("Ready to execute trade...");
      
      // TODO: Add trade execution logic here

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      console.error("Trading error:", error);
    } finally {
      setStatus("Trading process completed");
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
