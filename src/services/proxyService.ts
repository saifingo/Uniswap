// Proxy service for web to avoid CORS issues
import { Platform } from 'react-native';

// Public RPC endpoints that allow CORS (for web development only)
const WEB_FALLBACK_RPCS = {
  ethereum: {
    mainnet: 'https://eth.llamarpc.com',
    testnet: 'https://rpc.sepolia.org',
  },
  solana: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.devnet.solana.com',
  },
};

export const getEthereumRpcUrl = (network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  // On web, use public RPC to avoid CORS
  if (Platform.OS === 'web') {
    console.warn('Using public RPC on web - limited functionality due to CORS restrictions');
    return WEB_FALLBACK_RPCS.ethereum[network];
  }
  
  // On mobile, use Alchemy (no CORS issues)
  const apiKey = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY || 'demo';
  return network === 'mainnet'
    ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
    : `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
};

export const getSolanaRpcUrl = (network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  // On web, use public RPC
  if (Platform.OS === 'web') {
    console.warn('Using public Solana RPC on web - may be rate limited');
    return WEB_FALLBACK_RPCS.solana[network];
  }
  
  // On mobile, use configured RPC
  return process.env.EXPO_PUBLIC_SOLANA_RPC_URL || WEB_FALLBACK_RPCS.solana[network];
};

// Check if running on web
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

// Show web limitations warning
export const showWebWarning = (): void => {
  if (isWeb()) {
    console.warn(`
╔════════════════════════════════════════════════════════════╗
║  WEB DEVELOPMENT MODE - LIMITED FUNCTIONALITY              ║
╠════════════════════════════════════════════════════════════╣
║  • Using public RPC endpoints (rate limited)               ║
║  • Some features may not work due to CORS                  ║
║  • For full functionality, run on mobile:                  ║
║    - npx expo start (scan QR with Expo Go)                 ║
║    - npx expo run:ios                                      ║
║    - npx expo run:android                                  ║
╚════════════════════════════════════════════════════════════╝
    `);
  }
};
