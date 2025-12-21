import { ethers } from 'ethers';
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { Platform } from 'react-native';
import { ENV, NETWORKS } from '../config/env';
import { StorageService } from './storage';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  contractAddress: string;
  decimals: number;
  logo?: string;
  priceUsd?: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  type: 'send' | 'receive';
  timestamp: number;
  blockNumber: string;
  status?: 'success' | 'failed' | 'pending';
}

export class EthereumService {
  private static alchemy: Alchemy;
  private static provider: ethers.JsonRpcProvider;

  /**
   * Initialize Alchemy SDK and provider
   */
  static initialize() {
    // On web, use public RPC to avoid CORS issues
    if (Platform.OS === 'web') {
      console.warn('⚠️ Running on web - using public RPC (limited functionality)');
      const publicRpc = ENV.NETWORK === 'testnet'
        ? 'https://rpc.sepolia.org'
        : 'https://eth.llamarpc.com';
      this.provider = new ethers.JsonRpcProvider(publicRpc);
      return;
    }

    // On mobile, use Alchemy (full functionality)
    const network = ENV.NETWORK === 'testnet' ? Network.ETH_SEPOLIA : Network.ETH_MAINNET;
    
    this.alchemy = new Alchemy({
      apiKey: ENV.ALCHEMY_API_KEY,
      network: network,
    });

    const rpcUrl = ENV.NETWORK === 'testnet' 
      ? NETWORKS.ethereum.testnet 
      : NETWORKS.ethereum.mainnet;
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Get ETH balance for an address
   */
  static async getEthBalance(address: string): Promise<string> {
    try {
      if (!this.provider) this.initialize();
      
      // Use provider instead of alchemy for web compatibility
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      throw new Error('Failed to fetch ETH balance');
    }
  }

  /**
   * Get all token balances for an address
   */
  static async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (!this.provider) this.initialize();

      // On web, Alchemy SDK is not available due to CORS
      // Return empty array - user needs to use mobile for full functionality
      if (Platform.OS === 'web') {
        console.warn('⚠️ Token balances not available on web. Use mobile app for full functionality.');
        return [];
      }

      if (!this.alchemy) {
        console.warn('Alchemy not initialized');
        return [];
      }

      const balances = await this.alchemy.core.getTokenBalances(address);
      const tokens: TokenBalance[] = [];

      for (const token of balances.tokenBalances) {
        if (token.tokenBalance && token.tokenBalance !== '0x0') {
          try {
            const metadata = await this.alchemy.core.getTokenMetadata(token.contractAddress);
            
            const balance = ethers.formatUnits(
              token.tokenBalance,
              metadata.decimals || 18
            );

            tokens.push({
              symbol: metadata.symbol || 'UNKNOWN',
              name: metadata.name || 'Unknown Token',
              balance: balance,
              contractAddress: token.contractAddress,
              decimals: metadata.decimals || 18,
              logo: metadata.logo || undefined,
            });
          } catch (err) {
            console.error('Error fetching token metadata:', err);
          }
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get transaction history for an address
   */
  static async getTransactionHistory(address: string): Promise<Transaction[]> {
    try {
      if (!this.alchemy) this.initialize();

      const [sentTxs, receivedTxs] = await Promise.all([
        this.alchemy.core.getAssetTransfers({
          fromAddress: address,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
          maxCount: 25,
          order: SortingOrder.DESCENDING,
        }),
        this.alchemy.core.getAssetTransfers({
          toAddress: address,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
          maxCount: 25,
          order: SortingOrder.DESCENDING,
        }),
      ]);

      const allTxs = [...sentTxs.transfers, ...receivedTxs.transfers];

      return allTxs.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value?.toString() || '0',
        asset: tx.asset || 'ETH',
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
        timestamp: Date.now(), // Fallback to current time since metadata type is not available
        blockNumber: tx.blockNum,
        status: 'success' as const,
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  /**
   * Send ETH transaction
   */
  static async sendEthTransaction(to: string, amount: string): Promise<{ success: boolean; hash: string }> {
    try {
      if (!this.provider) this.initialize();

      const privateKey = await StorageService.getEthPrivateKey();
      if (!privateKey) {
        throw new Error('Wallet not found. Please create or import a wallet.');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Validate address
      if (!ethers.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      // Get gas price
      const feeData = await this.provider.getFeeData();

      // Create and send transaction
      const tx = await wallet.sendTransaction({
        to: to,
        value: ethers.parseEther(amount),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('Transaction failed');
      }

      return {
        success: true,
        hash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error sending ETH transaction:', error);
      
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient balance to complete transaction');
      } else if (error.message.includes('invalid address')) {
        throw new Error('Invalid recipient address');
      } else if (error.message.includes('gas')) {
        throw new Error('Gas estimation failed. Network may be congested.');
      }
      
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Send ERC20 token transaction
   */
  static async sendERC20Token(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number
  ): Promise<{ success: boolean; hash: string }> {
    try {
      if (!this.provider) this.initialize();

      const privateKey = await StorageService.getEthPrivateKey();
      if (!privateKey) {
        throw new Error('Wallet not found');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Validate addresses
      if (!ethers.isAddress(to) || !ethers.isAddress(tokenAddress)) {
        throw new Error('Invalid address');
      }

      // ERC20 ABI
      const erc20ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
      ];

      const contract = new ethers.Contract(tokenAddress, erc20ABI, wallet);
      const amountInWei = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(to, amountInWei);
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error('Transaction failed');
      }

      return {
        success: true,
        hash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error sending ERC20 token:', error);
      
      if (error.message.includes('insufficient')) {
        throw new Error('Insufficient token balance');
      }
      
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Estimate gas for ETH transaction
   */
  static async estimateGas(to: string, amount: string): Promise<string> {
    try {
      if (!this.provider) this.initialize();

      const feeData = await this.provider.getFeeData();
      const gasLimit = 21000n; // Standard ETH transfer

      const maxFee = feeData.maxFeePerGas || feeData.gasPrice || 0n;
      const gasCost = gasLimit * maxFee;

      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '0.001'; // Fallback estimate
    }
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}

// Initialize on module load
EthereumService.initialize();
