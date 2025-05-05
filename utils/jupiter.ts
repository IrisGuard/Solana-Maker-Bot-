// utils/jupiter.ts
import axios from "axios";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

// Type definitions
export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  swapTransaction: string;
  slippageBps: number;
}

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
): Promise<JupiterQuote | null> {
  try {
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    
    const response = await axios.get<{ data: JupiterQuote[] }>(url, {
      timeout: 15_000
    });

    if (!response.data.data?.length) return null;
    
    return response.data.data[0];
  } catch (error) {
    console.error("Failed to get Jupiter quote:", error);
    return null;
  }
}

export async function executeSwap(
  swapTransaction: string,
  connection: Connection,
  wallet: Keypair
): Promise<string> {
  try {
    const txBuffer = Buffer.from(swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(txBuffer);
    tx.sign([wallet]);
    
    const txid = await connection.sendTransaction(tx);
    return txid;
  } catch (error) {
    console.error("Swap execution failed:", error);
    throw new Error(`Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
