import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// 1. Get projectId at https://cloud.reown.com
const projectId = '9dbdc0fbf30c32c1a73cff77a4ec4b95'
if (!projectId) throw new Error('Project ID is undefined')

// 2. Create metadata
const metadata = {
  name: 'Your App Name',
  description: 'Your App Description',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png']
}

// 3. Set up Solana Adapter
const solanaAdapter = new SolanaAdapter()

// 4. Initialize AppKit with social login features
const modal = createAppKit({
  projectId,
  metadata,
  adapters: [solanaAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  features: {
    analytics: true,
    email: true, // Enable email login
    socials: ['google', 'github', 'twitter', 'discord', 'apple', 'facebook'], // Enable social logins
    smartAccount: true // Enable Smart Account (Universal Wallet)
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00D4FF',
    '--w3m-color-mix-strength': 15
  }
})

export { modal }
