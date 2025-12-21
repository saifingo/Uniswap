import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Platform } from 'react-native';
import { ENV, NETWORKS } from '../config/env';
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
  private static connection: Connection;

  /**
   * Initialize Solana connection
   */
  static initialize() {
    // Use devnet for web to avoid rate limits and CORS issues
    let rpcUrl: string;
    
    if (Platform.OS === 'web') {
      console.warn('⚠️ Running on web - using Solana devnet (limited functionality)');
      rpcUrl = 'https://api.devnet.solana.com';
    } else {
      rpcUrl = ENV.NETWORK === 'testnet'
        ? NETWORKS.solana.testnet
        : NETWORKS.solana.mainnet;
    }

    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Get SOL balance for an address
   */
  static async getSolBalance(address: string): Promise<number> {
    try {
      if (!this.connection) this.initialize();

      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      // Return 0 instead of throwing to avoid breaking the UI
      return 0;
    }
  }

  /**
   * Get all SPL token balances for an address
   */
  static async getTokenBalances(address: string): Promise<SolanaTokenBalance[]> {
    try {
      if (!this.connection) this.initialize();

      const publicKey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokens: SolanaTokenBalance[] = [];

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const balance = info.tokenAmount.uiAmount;
        const decimals = info.tokenAmount.decimals;

        if (balance > 0) {
          const metadata = POPULAR_SPL_TOKENS[mint];
          tokens.push({
            mint,
            symbol: metadata?.symbol,
            name: metadata?.name,
            balance,
            decimals,
          });
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  }

  /**
   * Get transaction history for an address
   */
  static async getTransactionHistory(address: string): Promise<SolanaTransaction[]> {
    try {
      if (!this.connection) this.initialize();

      const publicKey = new PublicKey(address);

      // Get transaction signatures
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit: 50,
      });

      // Get transaction details
      const transactions = await this.connection.getParsedTransactions(
        signatures.map((sig) => sig.signature),
        { maxSupportedTransactionVersion: 0 }
      );

      return transactions.map((tx, index) => ({
        signature: signatures[index].signature,
        timestamp: (signatures[index].blockTime || 0) * 1000,
        type: 'unknown' as const,
        status: tx?.meta?.err ? 'failed' : 'success',
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  /**
   * Send SOL transaction
   */
  static async sendSolTransaction(
    to: string,
    amount: number
  ): Promise<{ success: boolean; signature: string }> {
    try {
      if (!this.connection) this.initialize();

      const privateKeyHex = await StorageService.getSolPrivateKey();
      if (!privateKeyHex) {
        throw new Error('Wallet not found. Please create or import a wallet.');
      }

      const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
      const keypair = Keypair.fromSecretKey(privateKeyBuffer);

      // Validate address
      let toPublicKey: PublicKey;
      try {
        toPublicKey = new PublicKey(to);
      } catch {
        throw new Error('Invalid recipient address');
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Send and confirm
      const signature = await sendAndConfirmTransaction(this.connection, transaction, [keypair]);

      return {
        success: true,
        signature,
      };
    } catch (error: any) {
      console.error('Error sending SOL transaction:', error);

      if (error.message.includes('insufficient')) {
        throw new Error('Insufficient balance to complete transaction');
      } else if (error.message.includes('invalid')) {
        throw new Error('Invalid recipient address');
      }

      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Send SPL token transaction
   */
  static async sendSPLToken(
    tokenMint: string,
    to: string,
    amount: number,
    decimals: number
  ): Promise<{ success: boolean; signature: string }> {
    try {
      if (!this.connection) this.initialize();

      const privateKeyHex = await StorageService.getSolPrivateKey();
      if (!privateKeyHex) {
        throw new Error('Wallet not found');
      }

      const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
      const keypair = Keypair.fromSecretKey(privateKeyBuffer);

      const mintPublicKey = new PublicKey(tokenMint);
      const toPublicKey = new PublicKey(to);

      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        keypair.publicKey
      );
      const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          keypair.publicKey,
          amount * Math.pow(10, decimals),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendAndConfirmTransaction(this.connection, transaction, [keypair]);

      return {
        success: true,
        signature,
      };
    } catch (error: any) {
      console.error('Error sending SPL token:', error);

      if (error.message.includes('insufficient')) {
        throw new Error('Insufficient token balance');
      }

      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Estimate transaction fee
   */
  static async estimateFee(): Promise<number> {
    try {
      if (!this.connection) this.initialize();

      const recentBlockhash = await this.connection.getRecentBlockhash();
      const fee = recentBlockhash.feeCalculator.lamportsPerSignature;
      return fee / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 0.000005; // Fallback estimate
    }
  }

  /**
   * Validate Solana address
   */
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

// Initialize on module load
SolanaService.initialize();
