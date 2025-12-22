import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { WalletService } from '../../services/walletService';
import { EthereumService } from '../../services/ethereumService';
import { SolanaService } from '../../services/solanaService';
import { PriceService } from '../../services/priceService';
import { StorageService, WalletInfo } from '../../services/storage';
import { getTokenIconUrl } from '../../services/tokenIconService';

interface Token {
  name: string;
  symbol: string;
  balance: string;
  value: string;
  change: number;
  logo?: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletInfo | null>(null);
  const [walletAddresses, setWalletAddresses] = useState<{ ethereum: string; solana: string } | null>(null);
  const [portfolioValue, setPortfolioValue] = useState('0.00');
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      console.log('Fetching wallet data...');
      
      // Get active wallet info
      const wallet = await StorageService.getActiveWallet();
      if (!wallet) {
        console.log('No active wallet found');
        setLoading(false);
        return;
      }
      
      setActiveWallet(wallet);
      const addresses = {
        ethereum: wallet.ethereumAddress,
        solana: wallet.solanaAddress,
      };
      setWalletAddresses(addresses);
      console.log('Active wallet:', wallet.name);
      console.log('Wallet addresses:', addresses);

      // Fetch balances and prices in parallel
      const [ethBalance, ethTokens, solBalance, solTokens, prices] = await Promise.all([
        EthereumService.getEthBalance(addresses.ethereum).catch(() => '0'),
        EthereumService.getTokenBalances(addresses.ethereum).catch(() => []),
        SolanaService.getSolBalance(addresses.solana).catch(() => 0),
        SolanaService.getTokenBalances(addresses.solana).catch(() => []),
        PriceService.fetchTokenPrices(['ethereum', 'solana', 'usd-coin', 'tether']).catch(() => []),
      ]);

      console.log('ETH Balance:', ethBalance);
      console.log('SOL Balance:', solBalance);
      console.log('Prices:', prices);

      // Create price map
      const priceMap: Record<string, { price: number; change: number }> = {};
      prices.forEach((token: any) => {
        priceMap[token.symbol.toUpperCase()] = {
          price: token.current_price || 0,
          change: token.price_change_percentage_24h || 0,
        };
      });

      // Build tokens array
      const allTokens: Token[] = [];
      let totalValue = 0;

      // Add ETH
      if (parseFloat(ethBalance) > 0) {
        const ethPrice = priceMap['ETH']?.price || 0;
        const ethValue = parseFloat(ethBalance) * ethPrice;
        totalValue += ethValue;
        allTokens.push({
          name: 'Ethereum',
          symbol: 'ETH',
          balance: parseFloat(ethBalance).toFixed(4),
          value: ethValue.toFixed(2),
          change: priceMap['ETH']?.change || 0,
          logo: getTokenIconUrl('ETH', undefined, 'ethereum'),
        });
      }

      // Add ERC20 tokens
      ethTokens.forEach((token: any) => {
        const balance = parseFloat(token.balance);
        if (balance > 0) {
          const price = priceMap[token.symbol]?.price || 0;
          const value = balance * price;
          totalValue += value;
          allTokens.push({
            name: token.name,
            symbol: token.symbol,
            balance: balance.toFixed(4),
            value: value.toFixed(2),
            change: priceMap[token.symbol]?.change || 0,
            logo: getTokenIconUrl(token.symbol, token.contractAddress, 'ethereum', token.logo),
          });
        }
      });

      // Add SOL
      if (solBalance > 0) {
        const solPrice = priceMap['SOL']?.price || 0;
        const solValue = solBalance * solPrice;
        totalValue += solValue;
        allTokens.push({
          name: 'Solana',
          symbol: 'SOL',
          balance: solBalance.toFixed(4),
          value: solValue.toFixed(2),
          change: priceMap['SOL']?.change || 0,
          logo: getTokenIconUrl('SOL', undefined, 'solana'),
        });
      }

      // Add SPL tokens
      solTokens.forEach((token: any) => {
        if (token.balance > 0) {
          const price = priceMap[token.symbol || '']?.price || 0;
          const value = token.balance * price;
          totalValue += value;
          allTokens.push({
            name: token.name || 'Unknown',
            symbol: token.symbol || 'UNKNOWN',
            balance: token.balance.toFixed(4),
            value: value.toFixed(2),
            change: priceMap[token.symbol || '']?.change || 0,
            logo: getTokenIconUrl(token.symbol || 'UNKNOWN', token.mint, 'solana'),
          });
        }
      });

      // Update state
      setTokens(allTokens);
      setPortfolioValue(totalValue.toFixed(2));
      
      // Calculate average change
      const avgChange = allTokens.length > 0
        ? allTokens.reduce((sum, t) => sum + t.change, 0) / allTokens.length
        : 0;
      setPortfolioChange(avgChange);

      console.log('Portfolio value:', totalValue);
      console.log('Total tokens:', allTokens.length);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF007A" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        address={walletAddresses?.ethereum || '0x0000000000000000'}
        walletName={activeWallet?.name}
        onSearchPress={() => navigation.navigate('Search')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF007A']} />
        }
      >
        <Card style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <View style={styles.portfolioInfo}>
              <Text style={styles.portfolioLabel}>Total Balance</Text>
              <Text style={styles.portfolioValue}>${portfolioValue}</Text>
              <View style={[styles.changeBadge, { backgroundColor: portfolioChange < 0 ? '#FFE5E5' : '#E8F5E9' }]}>
                <Ionicons 
                  name={portfolioChange >= 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={portfolioChange < 0 ? '#FF4D4D' : '#00C853'} 
                />
                <Text style={[styles.change, { color: portfolioChange < 0 ? '#FF4D4D' : '#00C853' }]}>
                  {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Assets</Text>
              <Text style={styles.statValue}>{tokens.length}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Chains</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wallet</Text>
              <Text style={styles.statValue}>{activeWallet?.name || 'Main'}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Buy')}
          >
            <MaterialCommunityIcons name="credit-card-plus" size={24} color="#FF007A" />
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Swap')}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={24} color="#FF007A" />
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Send')}
          >
            <Ionicons name="send" size={24} color="#FF007A" />
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My Tokens</Text>
        {tokens.length === 0 ? (
          <Card style={styles.tokenCard}>
            <Text style={styles.emptyText}>No tokens found. Your wallet is empty.</Text>
          </Card>
        ) : (
          tokens.map((token: Token, index: number) => (
            <Card key={index} style={styles.tokenCard}>
              <TouchableOpacity 
                style={styles.tokenRow}
                onPress={() => navigation.navigate('TokenDetails', { token })}
              >
                <View style={styles.tokenInfo}>
                  {token.logo ? (
                    <Image source={{ uri: token.logo }} style={styles.tokenIcon} />
                  ) : (
                    <View style={styles.tokenIconPlaceholder}>
                      <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenBalance}>{token.balance} {token.symbol}</Text>
                </View>
              </View>
              <View style={styles.tokenValue}>
                <Text style={styles.tokenPrice}>${token.value}</Text>
                <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                  {token.change}%
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  portfolioCard: {
    marginBottom: 16,
  },
  portfolioHeader: {
    marginBottom: 24,
  },
  portfolioInfo: {
    alignItems: 'flex-start',
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  portfolioValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  timeframeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: '#FF007A',
  },
  timeframeText: {
    color: '#666',
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: '#FFF',
  },
  tokenCard: {
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenBalance: {
    color: '#666',
    marginTop: 4,
  },
  tokenValue: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenChange: {
    marginTop: 4,
  },
});
