import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "d5844eccb8d32d9b5bd7646205e42e25";

if (!projectId) {
  throw new Error('Project ID is not defined')
}

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [mainnet, arbitrum,  avalanche, base, optimism, polygon]
})

export const wagmiConfig = wagmiAdapter.wagmiConfig