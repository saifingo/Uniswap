import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as Crypto from 'expo-crypto';
import { StorageService, WalletInfo } from './storage';
import * as LocalAuthentication from 'expo-local-authentication';

export interface WalletData {
  mnemonic: string;
  ethereum: {
    address: string;
    privateKey: string;
  };
  solana: {
    address: string;
    privateKey: string;
  };
}

export class WalletService {
  /**
   * Create new wallet with generated seed phrase
   */
  static async createWallet(walletName?: string): Promise<WalletData> {
    try {
      // Generate random mnemonic using ethers.js
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase;

      if (!mnemonic) {
        throw new Error('Failed to generate mnemonic');
      }

      return await this.deriveWalletFromMnemonic(mnemonic, walletName, false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet. Please try again.');
    }
  }

  /**
   * Import wallet from seed phrase
   */
  static async importWallet(mnemonic: string, walletName?: string): Promise<WalletData> {
    try {
      // Validate and normalize mnemonic
      const trimmedMnemonic = mnemonic.trim().toLowerCase();
      
      // Validate using ethers.js Mnemonic
      try {
        ethers.Mnemonic.fromPhrase(trimmedMnemonic);
      } catch (e) {
        throw new Error('Invalid seed phrase. Please check and try again.');
      }

      return await this.deriveWalletFromMnemonic(trimmedMnemonic, walletName, true);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error;
      }
      console.error('Error importing wallet:', error);
      throw new Error('Failed to import wallet. Please try again.');
    }
  }

  /**
   * Derive Ethereum and Solana wallets from mnemonic
   */
  private static async deriveWalletFromMnemonic(
    mnemonic: string,
    walletName?: string,
    isImported: boolean = false
  ): Promise<WalletData> {
    try {
      // Derive Ethereum wallet using ethers.js
      const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
      const ethAddress = ethWallet.address;
      const ethPrivateKey = ethWallet.privateKey;

      // Derive Solana wallet
      // Convert mnemonic to seed using ethers.js
      const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonic);
      const seedHex = mnemonicObj.computeSeed();
      const seedBuffer = Buffer.from(seedHex.slice(2), 'hex'); // Remove '0x' prefix
      
      const solanaKeypair = Keypair.fromSeed(seedBuffer.slice(0, 32));
      const solanaAddress = solanaKeypair.publicKey.toString();
      const solanaPrivateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

      // Generate unique wallet ID
      const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate wallet name if not provided
      const finalWalletName = walletName || `Wallet ${(await StorageService.getAllWallets()).length + 1}`;

      // Create wallet info
      const walletInfo: WalletInfo = {
        id: walletId,
        name: finalWalletName,
        ethereumAddress: ethAddress,
        solanaAddress: solanaAddress,
        createdAt: Date.now(),
        isImported: isImported,
      };

      // Store wallet info in multi-wallet list
      await StorageService.saveWalletInfo(walletInfo);

      // Set as active wallet automatically
      await StorageService.setActiveWallet(walletId);

      // Store securely with wallet ID
      await StorageService.setSecure(`wallet_mnemonic_${walletId}`, mnemonic);
      await StorageService.setSecure(`eth_private_key_${walletId}`, ethPrivateKey);
      await StorageService.setSecure(`sol_private_key_${walletId}`, solanaPrivateKey);
      
      // Also store in legacy format for backward compatibility
      await StorageService.saveMnemonic(mnemonic);
      await StorageService.saveEthPrivateKey(ethPrivateKey);
      await StorageService.saveSolPrivateKey(solanaPrivateKey);
      await StorageService.saveWalletAddresses({
        ethereum: ethAddress,
        solana: solanaAddress,
      });

      return {
        mnemonic,
        ethereum: {
          address: ethAddress,
          privateKey: ethPrivateKey,
        },
        solana: {
          address: solanaAddress,
          privateKey: solanaPrivateKey,
        },
      };
    } catch (error) {
      console.error('Error deriving wallet:', error);
      throw new Error('Failed to derive wallet from seed phrase');
    }
  }

  /**
   * Get current wallet addresses
   */
  static async getWalletAddresses(): Promise<{ ethereum: string; solana: string } | null> {
    return await StorageService.getWalletAddresses();
  }

  /**
   * Check if wallet exists
   */
  static async hasWallet(): Promise<boolean> {
    return await StorageService.hasWallet();
  }

  /**
   * Get Ethereum private key (requires authentication)
   */
  static async getEthPrivateKey(): Promise<string | null> {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    return await StorageService.getEthPrivateKey();
  }

  /**
   * Get Solana private key (requires authentication)
   */
  static async getSolPrivateKey(): Promise<string | null> {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    return await StorageService.getSolPrivateKey();
  }

  /**
   * Get mnemonic (requires authentication)
   */
  static async getMnemonic(): Promise<string | null> {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    return await StorageService.getMnemonic();
  }

  /**
   * Delete wallet (requires authentication)
   */
  static async deleteWallet(): Promise<void> {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    await StorageService.clearWallet();
  }

  /**
   * Authenticate with biometrics if enabled
   */
  static async authenticate(): Promise<boolean> {
    try {
      const biometricEnabled = await StorageService.isBiometricEnabled();
      
      if (!biometricEnabled) {
        return true; // Skip authentication if not enabled
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return true; // Skip if biometric not available
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access wallet',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Enable/disable biometric authentication
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await StorageService.setBiometricEnabled(enabled);
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      return false;
    }
  }
}
