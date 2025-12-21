// Service to fetch real token icons from various sources
import { Platform } from 'react-native';

// Token icon sources with fallbacks
const ICON_SOURCES = {
  // CoinGecko provides good quality token icons
  coingecko: (symbol: string) => 
    `https://assets.coingecko.com/coins/images/${getCoingeckoId(symbol)}/small/${symbol.toLowerCase()}.png`,
  
  // Trust Wallet assets (reliable for most tokens)
  trustwallet: (contractAddress: string, chain: 'ethereum' | 'solana' = 'ethereum') => {
    if (chain === 'ethereum') {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contractAddress}/logo.png`;
    } else {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${contractAddress}/logo.png`;
    }
  },
  
  // Fallback to generic crypto icons
  fallback: (symbol: string) => 
    `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`,
};

// Map common token symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  ETH: '279',
  BTC: '1',
  USDC: '3408',
  USDT: '825',
  DAI: '4943',
  WBTC: '3717',
  UNI: '7083',
  LINK: '1975',
  MATIC: '4713',
  SOL: '5426',
  BONK: '28600',
  JUP: '18876',
  USDC_SOL: '3408',
  USDT_SOL: '825',
};

function getCoingeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] || '1';
}

export interface TokenIcon {
  uri: string;
  source: 'coingecko' | 'trustwallet' | 'alchemy' | 'fallback';
}

/**
 * Get token icon URL with fallbacks
 */
export const getTokenIcon = (
  symbol: string,
  contractAddress?: string,
  chain: 'ethereum' | 'solana' = 'ethereum',
  alchemyLogo?: string
): TokenIcon => {
  // Priority 1: Use Alchemy logo if available (most reliable)
  if (alchemyLogo && alchemyLogo.startsWith('http')) {
    return { uri: alchemyLogo, source: 'alchemy' };
  }

  // Priority 2: Use Trust Wallet for contract addresses
  if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    return {
      uri: ICON_SOURCES.trustwallet(contractAddress, chain),
      source: 'trustwallet',
    };
  }

  // Priority 3: Use CoinGecko for known tokens
  if (COINGECKO_IDS[symbol.toUpperCase()]) {
    return {
      uri: ICON_SOURCES.coingecko(symbol),
      source: 'coingecko',
    };
  }

  // Priority 4: Fallback to generic icon
  return {
    uri: ICON_SOURCES.fallback(symbol),
    source: 'fallback',
  };
};

/**
 * Get native token icons (ETH, SOL, etc.)
 */
export const getNativeTokenIcon = (chain: 'ethereum' | 'solana'): string => {
  const icons = {
    ethereum: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    solana: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  };
  return icons[chain];
};

/**
 * Batch fetch token icons from CoinGecko API
 */
export const fetchTokenIconsFromCoinGecko = async (
  symbols: string[]
): Promise<Record<string, string>> => {
  try {
    const ids = symbols
      .map(s => COINGECKO_IDS[s.toUpperCase()])
      .filter(Boolean)
      .join(',');

    if (!ids) return {};

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    if (!response.ok) return {};

    const data = await response.json();
    const iconMap: Record<string, string> = {};

    data.forEach((coin: any) => {
      const symbol = coin.symbol.toUpperCase();
      iconMap[symbol] = coin.image;
    });

    return iconMap;
  } catch (error) {
    console.error('Error fetching token icons from CoinGecko:', error);
    return {};
  }
};

/**
 * Get default placeholder icon for unknown tokens
 */
export const getPlaceholderIcon = (): string => {
  return 'https://via.placeholder.com/40/FF007A/FFFFFF?text=?';
};

/**
 * Validate if icon URL is accessible
 */
export const validateIconUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get icon with automatic fallback handling
 */
export const getTokenIconWithFallback = async (
  symbol: string,
  contractAddress?: string,
  chain: 'ethereum' | 'solana' = 'ethereum',
  alchemyLogo?: string
): Promise<string> => {
  const icon = getTokenIcon(symbol, contractAddress, chain, alchemyLogo);
  
  // On web, skip validation to avoid CORS issues
  if (Platform.OS === 'web') {
    return icon.uri;
  }

  // Try to validate the icon URL
  const isValid = await validateIconUrl(icon.uri);
  if (isValid) {
    return icon.uri;
  }

  // If validation fails, try fallback
  if (icon.source !== 'fallback') {
    return getPlaceholderIcon();
  }

  return icon.uri;
};

/**
 * Common token icons (hardcoded for reliability)
 */
export const COMMON_TOKEN_ICONS: Record<string, string> = {
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  DAI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
  WBTC: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BONK: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
  JUP: 'https://assets.coingecko.com/coins/images/10351/small/logo512.png',
};

/**
 * Get icon from common tokens or fetch dynamically
 */
export const getTokenIconUrl = (
  symbol: string,
  contractAddress?: string,
  chain: 'ethereum' | 'solana' = 'ethereum',
  alchemyLogo?: string
): string => {
  // Check common tokens first
  const commonIcon = COMMON_TOKEN_ICONS[symbol.toUpperCase()];
  if (commonIcon) return commonIcon;

  // Use Alchemy logo if available
  if (alchemyLogo && alchemyLogo.startsWith('http')) {
    return alchemyLogo;
  }

  // Get from service
  const icon = getTokenIcon(symbol, contractAddress, chain, alchemyLogo);
  return icon.uri;
};
