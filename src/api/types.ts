export interface TokenData {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI?: string;
  balance?: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
