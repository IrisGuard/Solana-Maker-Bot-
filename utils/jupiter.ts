import axios from "axios";

export async function getJupiterQuote(inputMint: string, outputMint: string, amount: number) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`;
  const res = await axios.get(url);
  return res.data;
}
