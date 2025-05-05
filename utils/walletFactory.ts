import { Keypair } from "@solana/web3.js";
import { supabase } from "./supabaseClient";

export const generateWallet = () => Keypair.generate();

export const saveWallet = async (wallet: Keypair) => {
  await supabase.from("wallets").insert({
    pubkey: wallet.publicKey.toString(),
    secret_key: JSON.stringify(Array.from(wallet.secretKey))
  });
};
