import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Secure storage keys
const KEYS = {
  WALLET_MNEMONIC: 'wallet_mnemonic',
  ETH_PRIVATE_KEY: 'eth_private_key',
  SOL_PRIVATE_KEY: 'sol_private_key',
  ETH_ADDRESS: 'eth_address',
  SOL_ADDRESS: 'sol_address',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  WALLETS_LIST: 'wallets_list',
  ACTIVE_WALLET_ID: 'active_wallet_id',
  WALLET_ADDRESSES: 'wallet_addresses',
};

export interface WalletInfo {
  id: string;
  name: string;
  ethereumAddress: string;
  solanaAddress: string;
  createdAt: number;
  isImported: boolean;
}

// Check if SecureStore is available (not on web)
const isSecureStoreAvailable = Platform.OS !== 'web';

export class StorageService {
  // Secure storage for sensitive data
  static async setSecure(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback to AsyncStorage on web (NOT SECURE - for development only)
        console.warn('Using AsyncStorage fallback on web - NOT SECURE for production!');
        await AsyncStorage.setItem(`secure_${key}`, value);
      }
    } catch (error) {
      console.error('Storage error:', error);
      throw new Error('Failed to store data securely');
    }
  }

  static async getSecure(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        // Fallback to AsyncStorage on web
        return await AsyncStorage.getItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }

  static async deleteSecure(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        // Fallback to AsyncStorage on web
        await AsyncStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  // Regular storage for non-sensitive data
  static async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  }

  static async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage error:', error);
      return null;
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage error:', error);
    }
  }

  // Wallet-specific methods
  static async saveMnemonic(mnemonic: string): Promise<void> {
    await this.setSecure(KEYS.WALLET_MNEMONIC, mnemonic);
  }

  static async getMnemonic(): Promise<string | null> {
    return await this.getSecure(KEYS.WALLET_MNEMONIC);
  }

  static async saveEthPrivateKey(privateKey: string): Promise<void> {
    await this.setSecure(KEYS.ETH_PRIVATE_KEY, privateKey);
  }

  static async getEthPrivateKey(): Promise<string | null> {
    return await this.getSecure(KEYS.ETH_PRIVATE_KEY);
  }

  static async saveSolPrivateKey(privateKey: string): Promise<void> {
    await this.setSecure(KEYS.SOL_PRIVATE_KEY, privateKey);
  }

  static async getSolPrivateKey(): Promise<string | null> {
    return await this.getSecure(KEYS.SOL_PRIVATE_KEY);
  }

  static async saveWalletAddresses(addresses: { ethereum: string; solana: string }): Promise<void> {
    await this.set(KEYS.WALLET_ADDRESSES, JSON.stringify(addresses));
  }

  static async getWalletAddresses(): Promise<{ ethereum: string; solana: string } | null> {
    const data = await this.get(KEYS.WALLET_ADDRESSES);
    return data ? JSON.parse(data) : null;
  }

  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.set(KEYS.BIOMETRIC_ENABLED, enabled.toString());
  }

  static async isBiometricEnabled(): Promise<boolean> {
    const value = await this.get(KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  }

  static async clearWallet(): Promise<void> {
    await this.deleteSecure(KEYS.WALLET_MNEMONIC);
    await this.deleteSecure(KEYS.ETH_PRIVATE_KEY);
    await this.deleteSecure(KEYS.SOL_PRIVATE_KEY);
    await this.delete(KEYS.ETH_ADDRESS);
    await this.delete(KEYS.SOL_ADDRESS);
  }

  static async hasWallet(): Promise<boolean> {
    const mnemonic = await this.getMnemonic();
    return mnemonic !== null;
  }

  // Multi-wallet management
  static async saveWalletInfo(wallet: WalletInfo): Promise<void> {
    try {
      const wallets = await this.getAllWallets();
      const existingIndex = wallets.findIndex(w => w.id === wallet.id);
      
      if (existingIndex >= 0) {
        wallets[existingIndex] = wallet;
      } else {
        wallets.push(wallet);
      }
      
      await this.set(KEYS.WALLETS_LIST, JSON.stringify(wallets));
      
      // Set as active wallet if it's the first one
      if (wallets.length === 1) {
        await this.setActiveWallet(wallet.id);
      }
    } catch (error) {
      console.error('Error saving wallet info:', error);
    }
  }

  static async getAllWallets(): Promise<WalletInfo[]> {
    try {
      const walletsJson = await this.get(KEYS.WALLETS_LIST);
      return walletsJson ? JSON.parse(walletsJson) : [];
    } catch (error) {
      console.error('Error getting wallets:', error);
      return [];
    }
  }

  static async getWalletById(id: string): Promise<WalletInfo | null> {
    const wallets = await this.getAllWallets();
    return wallets.find(w => w.id === id) || null;
  }

  static async deleteWallet(id: string): Promise<void> {
    try {
      const wallets = await this.getAllWallets();
      const filtered = wallets.filter(w => w.id !== id);
      await this.set(KEYS.WALLETS_LIST, JSON.stringify(filtered));
      
      // Delete wallet keys
      await this.deleteSecure(`${KEYS.WALLET_MNEMONIC}_${id}`);
      await this.deleteSecure(`${KEYS.ETH_PRIVATE_KEY}_${id}`);
      await this.deleteSecure(`${KEYS.SOL_PRIVATE_KEY}_${id}`);
      
      // If deleted wallet was active, set first wallet as active
      const activeId = await this.getActiveWalletId();
      if (activeId === id && filtered.length > 0) {
        await this.setActiveWallet(filtered[0].id);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  }

  static async setActiveWallet(id: string): Promise<void> {
    await this.set(KEYS.ACTIVE_WALLET_ID, id);
  }

  static async getActiveWalletId(): Promise<string | null> {
    return await this.get(KEYS.ACTIVE_WALLET_ID);
  }

  static async getActiveWallet(): Promise<WalletInfo | null> {
    const activeId = await this.getActiveWalletId();
    if (!activeId) return null;
    return await this.getWalletById(activeId);
  }

  static async updateWalletName(id: string, name: string): Promise<void> {
    const wallet = await this.getWalletById(id);
    if (wallet) {
      wallet.name = name;
      await this.saveWalletInfo(wallet);
    }
  }
}
