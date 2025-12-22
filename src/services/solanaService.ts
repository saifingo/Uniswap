// Solana support temporarily disabled for Android compatibility
// Will be re-enabled with proper React Native compatible packages

import { Platform } from 'react-native';
import { StorageService } from './storage';

export interface SolanaTokenBalance {
  mint: string;
  symbol?: string;
  name?: string;
  balance: number;
  decimals: number;
  logo?: string;
  priceUsd?: number;
}

export interface SolanaTransaction {
  signature: string;
  timestamp: number;
  type: 'send' | 'receive' | 'unknown';
  status: 'success' | 'failed';
  amount?: number;
  from?: string;
  to?: string;
}

// Popular SPL tokens metadata
const POPULAR_SPL_TOKENS: Record<string, { name: string; symbol: string; coingeckoId: string }> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    name: 'USD Coin',
    symbol: 'USDC',
    coingeckoId: 'usd-coin',
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    name: 'Tether USD',
    symbol: 'USDT',
    coingeckoId: 'tether',
  },
  'So11111111111111111111111111111111111111112': {
    name: 'Wrapped SOL',
    symbol: 'SOL',
    coingeckoId: 'solana',
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    name: 'Bonk',
    symbol: 'BONK',
    coingeckoId: 'bonk',
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
    name: 'Jupiter',
    symbol: 'JUP',
    coingeckoId: 'jupiter-exchange-solana',
  },
};

export class SolanaService {
  /**
   * Initialize Solana connection (stub)
   */
  static initialize() {
    console.log('Solana service disabled - Ethereum only mode');
  }

  /**
   * Get SOL balance for an address (stub)
   */
  static async getSolBalance(address: string): Promise<number> {
    console.log('Solana disabled - returning 0 balance');
    return 0;
  }

  /**
   * Get all SPL token balances for an address (stub)
   */
  static async getTokenBalances(address: string): Promise<SolanaTokenBalance[]> {
    console.log('Solana disabled - returning empty token list');
    return [];
  }

  /**
   * Get transaction history for an address (stub)
   */
  static async getTransactionHistory(address: string): Promise<SolanaTransaction[]> {
    console.log('Solana disabled - returning empty transaction history');
    return [];
  }

  /**
   * Send SOL transaction (stub)
   */
  static async sendSolTransaction(
    to: string,
    amount: number
  ): Promise<{ success: boolean; signature: string }> {
    throw new Error('Solana transactions are currently disabled. Ethereum only mode.');
  }

  /**
   * Send SPL token transaction (stub)
   */
  static async sendSPLToken(
    tokenMint: string,
    to: string,
    amount: number,
    decimals: number
  ): Promise<{ success: boolean; signature: string }> {
    throw new Error('Solana transactions are currently disabled. Ethereum only mode.');
  }

  /**
   * Estimate transaction fee (stub)
   */
  static async estimateFee(): Promise<number> {
    return 0;
  }

  /**
   * Validate Solana address (stub)
   */
  static isValidAddress(address: string): boolean {
    // Basic validation for Solana address format (base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
}

// Initialize on module load
SolanaService.initialize();
