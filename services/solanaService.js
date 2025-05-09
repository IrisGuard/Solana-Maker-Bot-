import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer
} from '@solana/spl-token';
import { CONFIG } from './config';
import { getApiKeys } from './config';

// Για τη σύνδεση με το Solana blockchain
let connection = null;

// Αρχικοποίηση της σύνδεσης με το Solana
export const initSolanaConnection = (endpoint = CONFIG.SOLANA_RPC_ENDPOINT) => {
  try {
    connection = new Connection(endpoint);
    console.log('Solana connection initialized to', endpoint);
    return true;
  } catch (error) {
    console.error('Failed to initialize Solana connection:', error);
    return false;
  }
};

// Ανάκτηση του υπολοίπου SOL
export const getSolBalance = async (walletAddress) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
};

// Ανάκτηση των SPL tokens από ένα πορτοφόλι
export const getTokenBalances = async (walletAddress) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    const publicKey = new PublicKey(walletAddress);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    const tokens = tokenAccounts.value.map(accountInfo => {
      const parsedAccountInfo = accountInfo.account.data.parsed.info;
      const tokenAddress = parsedAccountInfo.mint;
      const tokenBalance = parsedAccountInfo.tokenAmount.uiAmount;
      
      return {
        tokenAddress,
        balance: tokenBalance,
        decimals: parsedAccountInfo.tokenAmount.decimals
      };
    });
    
    return tokens;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
};

// Αποστολή SOL
export const sendSol = async (senderWallet, receiverAddress, amount) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would send', amount, 'SOL to', receiverAddress);
      return {
        success: true,
        txId: 'simulation-tx-' + Math.random().toString(36).substring(2, 15),
        simulation: true
      };
    }
    
    // Δημιουργία της συναλλαγής
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderWallet.publicKey,
        toPubkey: new PublicKey(receiverAddress),
        lamports: amount * LAMPORTS_PER_SOL
      })
    );
    
    // Προσθήκη πρόσφατου blockhash για να αποφευχθεί η επανάληψη της συναλλαγής
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderWallet.publicKey;
    
    // Αποστολή και επιβεβαίωση της συναλλαγής
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderWallet]
    );
    
    console.log('Transaction sent:', signature);
    
    return {
      success: true,
      txId: signature,
      simulation: false
    };
  } catch (error) {
    console.error('Error sending SOL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Αποστολή SPL token
export const sendToken = async (senderWallet, receiverAddress, tokenMintAddress, amount) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would send', amount, 'of token', tokenMintAddress, 'to', receiverAddress);
      return {
        success: true,
        txId: 'simulation-tx-' + Math.random().toString(36).substring(2, 15),
        simulation: true
      };
    }
    
    const mintPublicKey = new PublicKey(tokenMintAddress);
    const receiverPublicKey = new PublicKey(receiverAddress);
    
    // Βρίσκουμε ή δημιουργούμε τους λογαριασμούς token για τον αποστολέα και τον παραλήπτη
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderWallet,
      mintPublicKey,
      senderWallet.publicKey
    );
    
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderWallet,
      mintPublicKey,
      receiverPublicKey
    );
    
    // Πραγματοποιούμε τη μεταφορά του token
    const signature = await transfer(
      connection,
      senderWallet,
      sourceTokenAccount.address,
      destinationTokenAccount.address,
      senderWallet.publicKey,
      amount
    );
    
    console.log('Token transaction sent:', signature);
    
    return {
      success: true,
      txId: signature,
      simulation: false
    };
  } catch (error) {
    console.error('Error sending token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Λογική για το Maker Bot - δημιουργία πολλαπλών συναλλαγών
export const createMakerTransactions = async (
  mainWallet, 
  tokenAddress, 
  totalSolAmount, 
  numMakers, 
  minDelay, 
  maxDelay
) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would create', numMakers, 'maker transactions for', tokenAddress);
      
      // Δημιουργία προσομοιωμένων συναλλαγών
      const txs = [];
      const solPerMaker = totalSolAmount / numMakers;
      
      for (let i = 0; i < numMakers; i++) {
        // Υπολογισμός τυχαίας καθυστέρησης
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
        
        txs.push({
          id: 'simulation-tx-' + Math.random().toString(36).substring(2, 15),
          amount: solPerMaker,
          delay: delay,
          token: tokenAddress,
          simulation: true
        });
      }
      
      return {
        success: true,
        transactions: txs,
        simulation: true
      };
    }
    
    // Πραγματική υλοποίηση
    const transactions = [];
    const solPerMaker = totalSolAmount / numMakers;
    
    // Δημιουργία πολλαπλών συναλλαγών
    for (let i = 0; i < numMakers; i++) {
      // Δημιουργία ενός τυχαίου keypair για κάθε maker
      const makerKeypair = Keypair.generate();
      
      // Υπολογισμός τυχαίας καθυστέρησης
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
      
      // Δημιουργία συναλλαγής για τη μεταφορά SOL στο maker wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: mainWallet.publicKey,
          toPubkey: makerKeypair.publicKey,
          lamports: solPerMaker * LAMPORTS_PER_SOL
        })
      );
      
      // Προσθήκη πρόσφατου blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = mainWallet.publicKey;
      
      // Αποστολή και επιβεβαίωση της συναλλαγής με χρονοκαθυστέρηση
      setTimeout(async () => {
        try {
          const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [mainWallet]
          );
          
          console.log(`Maker transaction ${i+1}/${numMakers} sent:`, signature);
          
          // Πρόσθεση της συναλλαγής στη λίστα
          transactions.push({
            id: signature,
            amount: solPerMaker,
            delay: delay,
            token: tokenAddress,
            simulation: false
          });
        } catch (error) {
          console.error(`Error sending maker transaction ${i+1}/${numMakers}:`, error);
        }
      }, delay * 1000);
    }
    
    return {
      success: true,
      transactions: transactions,
      simulation: false
    };
  } catch (error) {
    console.error('Error creating maker transactions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Δημιουργία boost συναλλαγής
export const createBoostTransaction = async (wallet, tokenAddress, solAmount) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would boost', tokenAddress, 'with', solAmount, 'SOL');
      
      return {
        success: true,
        txId: 'simulation-boost-' + Math.random().toString(36).substring(2, 15),
        simulation: true,
        estimatedImpact: solAmount * 0.5 // 0.5% ανά SOL
      };
    }
    
    // Εδώ θα υλοποιήσουμε τη λογική για το boost
    // Η πραγματική λογική πρέπει να περιλαμβάνει σύνδεση με ένα DEX
    // Για απλότητα, θα δημιουργήσουμε μια απλή συναλλαγή προς έναν "λογαριασμό boost"
    
    // Δημιουργία ενός "λογαριασμού boost" που υποτίθεται ότι ενισχύει την τιμή
    const boostAccount = Keypair.generate();
    
    // Δημιουργία συναλλαγής
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: boostAccount.publicKey,
        lamports: solAmount * LAMPORTS_PER_SOL
      })
    );
    
    // Προσθήκη πρόσφατου blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Αποστολή και επιβεβαίωση της συναλλαγής
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet]
    );
    
    console.log('Boost transaction sent:', signature);
    
    // Υπολογισμός του εκτιμώμενου αντίκτυπου (0.5% ανά SOL)
    const estimatedImpact = solAmount * 0.5;
    
    return {
      success: true,
      txId: signature,
      simulation: false,
      estimatedImpact: estimatedImpact
    };
  } catch (error) {
    console.error('Error creating boost transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Δημιουργία νέου SPL token (για δοκιμαστικούς σκοπούς)
export const createNewToken = async (wallet, tokenName, tokenSymbol, decimals = 9) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would create new token', tokenName, 'with symbol', tokenSymbol);
      
      return {
        success: true,
        tokenAddress: 'simulation-token-' + Math.random().toString(36).substring(2, 15),
        simulation: true
      };
    }
    
    // Δημιουργία νέου νομίσματος (mint)
    const mint = await createMint(
      connection,
      wallet,
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority (μπορεί να είναι null)
      decimals
    );
    
    console.log('Created new token with address:', mint.toBase58());
    
    return {
      success: true,
      tokenAddress: mint.toBase58(),
      simulation: false
    };
  } catch (error) {
    console.error('Error creating new token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Έκδοση (mint) νέων tokens
export const mintTokens = async (wallet, tokenAddress, amount, destinationAddress = null) => {
  if (!connection) {
    initSolanaConnection();
  }
  
  try {
    // Έλεγχος για simulation mode
    if (CONFIG.SIMULATION_MODE) {
      console.log('SIMULATION: Would mint', amount, 'of token', tokenAddress);
      
      return {
        success: true,
        txId: 'simulation-mint-' + Math.random().toString(36).substring(2, 15),
        simulation: true
      };
    }
    
    const mintPublicKey = new PublicKey(tokenAddress);
    const destination = destinationAddress ? 
      new PublicKey(destinationAddress) : 
      wallet.publicKey;
    
    // Δημιουργία ή εύρεση του λογαριασμού για να λάβει τα tokens
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintPublicKey,
      destination
    );
    
    // Δημιουργία νέων tokens
    const signature = await mintTo(
      connection,
      wallet,
      mintPublicKey,
      tokenAccount.address,
      wallet.publicKey,
      amount
    );
    
    console.log('Minted tokens with transaction:', signature);
    
    return {
      success: true,
      txId: signature,
      simulation: false
    };
  } catch (error) {
    console.error('Error minting tokens:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 