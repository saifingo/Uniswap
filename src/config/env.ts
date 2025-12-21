// Environment configuration
export const ENV = {
  ALCHEMY_API_KEY: process.env.EXPO_PUBLIC_ALCHEMY_API_KEY || 'demo',
  SOLANA_RPC_URL: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  NETWORK: process.env.EXPO_PUBLIC_NETWORK || 'mainnet',
};

// Network configurations
export const NETWORKS = {
  ethereum: {
    mainnet: `https://eth-mainnet.g.alchemy.com/v2/${ENV.ALCHEMY_API_KEY}`,
    testnet: `https://eth-sepolia.g.alchemy.com/v2/${ENV.ALCHEMY_API_KEY}`,
  },
  solana: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.devnet.solana.com',
  },
};

// CoinGecko API
export const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Token ID mappings for CoinGecko
export const TOKEN_IDS = {
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  WBTC: 'wrapped-bitcoin',
  UNI: 'uniswap',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  BONK: 'bonk',
  JUP: 'jupiter-exchange-solana',
};
