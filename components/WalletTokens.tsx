import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export interface TokenInfo {
  mint: string;
  amount: number;
  decimals: number;
}

interface WalletTokensProps {
  onTokensChange?: (tokens: string[]) => void;
}

export default function WalletTokens({ onTokensChange }: WalletTokensProps) {
  const { publicKey, connected } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [manualToken, setManualToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (connected && publicKey) {
      fetchTokens();
    } else {
      setTokens([]);
      setSelectedTokens([]);
    }
  }, [connected, publicKey]);

  const fetchTokens = async () => {
    setLoading(true);
    setError('');
    try {
      const connection = new Connection(SOLANA_RPC);
      // Fetch all SPL token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      const tokensList: TokenInfo[] = tokenAccounts.value
        .map((acc: any) => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint as string,
            amount: info.tokenAmount.uiAmount as number,
            decimals: info.tokenAmount.decimals as number,
          };
        })
        .filter((t: TokenInfo) => t.amount > 0);
      setTokens(tokensList);
    } catch (e) {
      setError('Failed to fetch tokens');
    }
    setLoading(false);
  };

  const handleSelectToken = (mint: string) => {
    setSelectedTokens((prev: string[]) => {
      const exists = prev.includes(mint);
      const updated = exists ? prev.filter((t: string) => t !== mint) : [...prev, mint];
      onTokensChange && onTokensChange(updated);
      return updated;
    });
  };

  const handleAddManualToken = () => {
    if (manualToken && manualToken.length === 44) {
      setSelectedTokens((prev: string[]) => {
        const updated = prev.includes(manualToken) ? prev : [...prev, manualToken];
        onTokensChange && onTokensChange(updated);
        return updated;
      });
      setManualToken('');
    } else {
      setError('Invalid token address');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Wallet Tokens</Text>
      {loading && <Text>Loading tokens...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {tokens.length === 0 && !loading && <Text>No tokens found.</Text>}
      {tokens.map((token: TokenInfo) => (
        <View key={token.mint} style={styles.tokenRow}>
          <Text style={styles.tokenMint}>{token.mint}</Text>
          <Text style={styles.tokenAmount}>{token.amount}</Text>
          <Button
            title={selectedTokens.includes(token.mint) ? 'Remove' : 'Add'}
            onPress={() => handleSelectToken(token.mint)}
          />
        </View>
      ))}
      <View style={styles.manualAddRow}>
        <TextInput
          style={styles.input}
          placeholder="Add token address manually"
          value={manualToken}
          onChangeText={setManualToken}
        />
        <Button title="Add" onPress={handleAddManualToken} />
      </View>
      <Text style={styles.selectedTitle}>Selected Tokens for Bot:</Text>
      {selectedTokens.map((mint: string) => (
        <Text key={mint} style={styles.selectedToken}>{mint}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tokenMint: { flex: 1, fontSize: 12 },
  tokenAmount: { width: 60, textAlign: 'right', marginRight: 8 },
  manualAddRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4, marginRight: 8 },
  selectedTitle: { marginTop: 16, fontWeight: 'bold' },
  selectedToken: { fontSize: 12, color: '#333' },
}); 