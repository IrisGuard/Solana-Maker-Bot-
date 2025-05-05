// utils/walletFactory.ts
import { Keypair } from "@solana/web3.js";
import { supabase } from "./supabaseClient.js"; // Προσθήκη .js extension

// Δημιουργία νέου Solana wallet
export const generateWallet = (): Keypair => {
  return Keypair.generate();
};

// Αποθήκευση wallet στο Supabase
export const saveWallet = async (wallet: Keypair): Promise<void> => {
  try {
    const { error } = await supabase
      .from("wallets")
      .insert({
        pubkey: wallet.publicKey.toString(),
        secret_key: JSON.stringify(Array.from(wallet.secretKey))
      });

    if (error) {
      throw new Error(`Supabase save failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Wallet save error:", error);
    throw error;
  }
};
