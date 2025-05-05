// utils/walletFactory.ts
import { Keypair } from "@solana/web3.js";
import { supabase } from "../services/supabase";

export const generateWallet = (): Keypair => Keypair.generate();

export const saveWallet = async (wallet: Keypair): Promise<void> => {
  const { error } = await supabase
    .from("wallets")
    .insert({
      pubkey: wallet.publicKey.toString(),
      secret_key: JSON.stringify(Array.from(wallet.secretKey))
    });

  if (error) throw new Error(error.message);
};
