import { useState } from "react";
import { getJupiterQuote } from "../../utils/jupiter";
import { generateWallet, saveWallet } from "../../utils/walletFactory";

export default function BotControl() {
  const [isTrading, setIsTrading] = useState(false);

  const startTrading = async () => {
    setIsTrading(true);
    
    // Δημιουργία νέου wallet
    const wallet = generateWallet();
    await saveWallet(wallet);

    // Παράδειγμα: Αγορά HPEPE με 0.1 SOL
    const quote = await getJupiterQuote(
      "So11111111111111111111111111111111111111112", // SOL mint
      "8PZn1LKTfJSBgnDb4JzhMD9DdvhnE9GA61dKwZr5YUTE", // HPEPE mint
      100_000_000 // 0.1 SOL σε lamports
    );

    if (quote) {
      console.log("Διαθέσιμο quote:", quote.outAmount);
      // Προσθήκη execution logic εδώ
    }

    setIsTrading(false);
  };

  return (
    <button onClick={startTrading} disabled={isTrading}>
      {isTrading ? "Γίνεται συναλλαγή..." : "Έναρξη Trading"}
    </button>
  );
}
