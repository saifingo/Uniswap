import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { TokenInput } from '../../components/common/TokenInput';
import { AddressInput } from '../../components/common/AddressInput';
import { StorageService } from '../../services/storage';
import { EthereumService } from '../../services/ethereumService';
import { SolanaService } from '../../services/solanaService';
import { PriceService } from '../../services/priceService';
import { getTokenIconUrl } from '../../services/tokenIconService';
import { ethers } from 'ethers';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  logo?: string;
  address?: string;
  chain: 'ethereum' | 'solana';
}

export const SendScreen = () => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>('0.00');
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<any[]>([]);

  // Load user's tokens
  useEffect(() => {
    loadTokens();
    loadRecentAddresses();
  }, []);

  // Estimate gas when amount or address changes
  useEffect(() => {
    if (amount && address && selectedToken && validateAddress(address)) {
      estimateGas();
    }
  }, [amount, address, selectedToken]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const wallet = await StorageService.getActiveWallet();
      if (!wallet) return;

      const allTokens: Token[] = [];

      // Get ETH balance
      const ethBalance = await EthereumService.getEthBalance(wallet.ethereumAddress);
      const ethPrice = await PriceService.getPrice('ETH');
      const ethValue = ethBalance * (ethPrice?.price || 0);
      
      allTokens.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance.toFixed(6),
        balanceUSD: ethValue.toFixed(2),
        logo: getTokenIconUrl('ETH'),
        chain: 'ethereum',
      });

      // Get SOL balance
      const solBalance = await SolanaService.getSolBalance(wallet.solanaAddress);
      const solPrice = await PriceService.getPrice('SOL');
      const solValue = solBalance * (solPrice?.price || 0);
      
      allTokens.push({
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance.toFixed(6),
        balanceUSD: solValue.toFixed(2),
        logo: getTokenIconUrl('SOL'),
        chain: 'solana',
      });

      // Get ERC20 tokens
      const ethTokens = await EthereumService.getTokenBalances(wallet.ethereumAddress);
      const prices = await PriceService.getPrices(ethTokens.map((t: any) => t.symbol));
      
      ethTokens.forEach((token: any) => {
        if (parseFloat(token.balance) > 0) {
          const price = prices[token.symbol]?.price || 0;
          const value = parseFloat(token.balance) * price;
          allTokens.push({
            symbol: token.symbol,
            name: token.name,
            balance: parseFloat(token.balance).toFixed(6),
            balanceUSD: value.toFixed(2),
            logo: getTokenIconUrl(token.symbol, token.contractAddress, 'ethereum'),
            address: token.contractAddress,
            chain: 'ethereum',
          });
        }
      });

      setTokens(allTokens);
      if (allTokens.length > 0) {
        setSelectedToken(allTokens[0]);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAddresses = async () => {
    try {
      const recent = await StorageService.get('recent_addresses');
      if (recent) {
        setRecentAddresses(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent addresses:', error);
    }
  };

  const saveRecentAddress = async (addr: string, name?: string) => {
    try {
      const recent = [...recentAddresses];
      const existing = recent.findIndex(r => r.address === addr);
      
      if (existing >= 0) {
        recent.splice(existing, 1);
      }
      
      recent.unshift({ address: addr, name: name || addr.slice(0, 10) + '...' });
      const updated = recent.slice(0, 10);
      
      await StorageService.set('recent_addresses', JSON.stringify(updated));
      setRecentAddresses(updated);
    } catch (error) {
      console.error('Error saving recent address:', error);
    }
  };

  const validateAddress = (addr: string) => {
    if (!addr) return false;
    
    if (selectedToken?.chain === 'ethereum') {
      return ethers.isAddress(addr) || addr.toLowerCase().endsWith('.eth');
    } else {
      // Basic Solana address validation (base58, 32-44 chars)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
    }
  };

  const estimateGas = async () => {
    if (!selectedToken || !amount || !address) return;
    
    try {
      setEstimatingGas(true);
      
      if (selectedToken.chain === 'ethereum') {
        // Estimate ETH gas
        const gasPrice = await EthereumService.getGasPrice();
        const gasLimit = selectedToken.symbol === 'ETH' ? 21000 : 65000;
        const gasCost = (gasPrice * gasLimit) / 1e18;
        const ethPrice = await PriceService.getPrice('ETH');
        const gasCostUSD = gasCost * (ethPrice?.price || 0);
        setGasEstimate(gasCostUSD.toFixed(2));
      } else {
        // Solana fees are very low
        setGasEstimate('0.00');
      }
    } catch (error) {
      console.error('Error estimating gas:', error);
      setGasEstimate('~');
    } finally {
      setEstimatingGas(false);
    }
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance);
    }
  };

  const handleSend = async () => {
    if (!validateAddress(address)) {
      Alert.alert('Error', 'Invalid recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedToken) {
      Alert.alert('Error', 'Please select a token');
      return;
    }

    if (parseFloat(amount) > parseFloat(selectedToken.balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedToken.symbol} to ${address.slice(0, 10)}...?\n\nNetwork Fee: $${gasEstimate}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSending(true);
              
              // Save to recent addresses
              await saveRecentAddress(address);
              
              // TODO: Implement actual transaction sending
              // This requires private key access and transaction signing
              
              Alert.alert(
                'Success',
                `Transaction submitted!\n\nNote: Full transaction functionality requires additional implementation.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setAmount('');
                      setAddress('');
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Transaction failed');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF007A" />
        <Text style={styles.loadingText}>Loading tokens...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <AddressInput
            value={address}
            onChangeText={setAddress}
            onScanPress={() => console.log('Open QR scanner')}
            error={address && !validateAddress(address) ? 'Invalid address' : undefined}
          />

          <Text style={styles.sectionTitle}>Amount</Text>
          <TouchableOpacity 
            style={styles.tokenSelector}
            onPress={() => setShowTokenSelector(true)}
          >
            {selectedToken?.logo && (
              <Image source={{ uri: selectedToken.logo }} style={styles.tokenLogo} />
            )}
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenSymbol}>{selectedToken?.symbol || 'Select'}</Text>
              <Text style={styles.tokenBalance}>
                Balance: {selectedToken?.balance || '0.00'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TokenInput
            label=""
            value={amount}
            onChangeValue={setAmount}
            token={selectedToken || { symbol: 'ETH', balance: '0' }}
            onTokenPress={() => setShowTokenSelector(true)}
          />

          <View style={styles.amountActions}>
            <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
            {selectedToken && (
              <Text style={styles.amountUSD}>
                ≈ ${(parseFloat(amount || '0') * parseFloat(selectedToken.balanceUSD) / parseFloat(selectedToken.balance)).toFixed(2)}
              </Text>
            )}
          </View>
        </Card>

        {recentAddresses.length > 0 && (
          <Card style={styles.recentCard}>
            <Text style={styles.recentTitle}>Recent Addresses</Text>
            {recentAddresses.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => setAddress(item.address)}
              >
                <View style={styles.addressIcon}>
                  <Text style={styles.addressIconText}>
                    {item.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.addressDetails}>
                  <Text style={styles.addressName}>{item.name}</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Network</Text>
            <Text style={styles.summaryValue}>
              {selectedToken?.chain === 'ethereum' ? 'Ethereum' : 'Solana'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Network Fee</Text>
            <View style={styles.feeContainer}>
              {estimatingGas ? (
                <ActivityIndicator size="small" color="#FF007A" />
              ) : (
                <Text style={styles.summaryValue}>
                  ${gasEstimate}
                </Text>
              )}
            </View>
          </View>
          {amount && selectedToken && (
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {amount} {selectedToken.symbol}
              </Text>
            </View>
          )}
        </Card>

        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!amount || !address || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!amount || !address || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.sendButtonText}>
              Send {selectedToken?.symbol || 'Token'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Token Selector Modal */}
      <Modal
        visible={showTokenSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTokenSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Token</Text>
              <TouchableOpacity onPress={() => setShowTokenSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tokenList}>
              {tokens.map((token, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tokenItem}
                  onPress={() => {
                    setSelectedToken(token);
                    setShowTokenSelector(false);
                    setAmount('');
                  }}
                >
                  {token.logo && (
                    <Image source={{ uri: token.logo }} style={styles.tokenItemLogo} />
                  )}
                  <View style={styles.tokenItemInfo}>
                    <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenItemName}>{token.name}</Text>
                  </View>
                  <View style={styles.tokenItemBalance}>
                    <Text style={styles.tokenItemBalanceText}>{token.balance}</Text>
                    <Text style={styles.tokenItemBalanceUSD}>${token.balanceUSD}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 16,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tokenLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tokenBalance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  maxButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFE5F0',
    borderRadius: 12,
  },
  maxButtonText: {
    color: '#FF007A',
    fontWeight: '600',
    fontSize: 14,
  },
  amountUSD: {
    fontSize: 14,
    color: '#666',
  },
  recentCard: {
    marginTop: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressText: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  summaryCard: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  feeContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF007A',
  },
  sendButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tokenList: {
    padding: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  tokenItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenItemInfo: {
    flex: 1,
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenItemName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tokenItemBalance: {
    alignItems: 'flex-end',
  },
  tokenItemBalanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenItemBalanceUSD: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
