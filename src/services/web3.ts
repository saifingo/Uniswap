import { ethers } from 'ethers';
import { NETWORKS, NetworkType } from '../constants/networks';

class Web3Service {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  
  async initialize(network: NetworkType = 'ETHEREUM_TESTNET') {
    try {
      const selectedNetwork = NETWORKS[network];
      this.provider = new ethers.providers.JsonRpcProvider(selectedNetwork.rpcUrls[0]);
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  }

  async connectWallet(privateKey: string) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      return this.wallet.address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getBalance(address: string) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async sendTransaction(to: string, amount: string) {
    try {
      if (!this.wallet) throw new Error('Wallet not connected');
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });
      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return null;
    }
  }
}

export const web3Service = new Web3Service();
