import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const ConnectButton = () => {
  const { connected } = useWallet()

  return (
    <WalletMultiButton className="!bg-blue-500 !text-white">
      {connected ? 'Connected' : 'Connect Wallet'}
    </WalletMultiButton>
  )
}
