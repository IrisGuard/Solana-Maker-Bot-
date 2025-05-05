// utils/jupiter.ts
import axios from "axios";

// Interface for Jupiter API response data
interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps: number;
}

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,  // Amount in lamports (e.g. 1 SOL = 1_000_000_000)
  slippage: number = 50  // Default 0.5% slippage (50 bps)
): Promise<JupiterQuote[]> {
  try {
    // Basic parameter validation
    if (!inputMint || !outputMint || amount <= 0) {
      throw new Error("Invalid inputMint, outputMint, or amount");
    }

    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippage}`;
    
    const response = await axios.get<{ data: JupiterQuote[] }>(url, {
      timeout: 10000  // 10 seconds timeout
    });

    if (!response.data.data.length) {
      throw new Error("No available quotes found");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("Jupiter API Error:", error.message);
    return [];
  }
}
