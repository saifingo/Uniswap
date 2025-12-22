import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { PriceService } from '../../services/priceService';
import { StorageService, WalletInfo } from '../../services/storage';
import { getTokenIconUrl, COMMON_TOKEN_ICONS } from '../../services/tokenIconService';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
  icon: string;
  rank?: number;
  high24h?: number;
  low24h?: number;
  priceChange24h?: number;
}

// Top tokens to fetch from CoinGecko
const TOP_TOKEN_IDS = [
  'bitcoin',
  'ethereum',
  'tether',
  'binancecoin',
  'solana',
  'usd-coin',
  'ripple',
  'cardano',
  'dogecoin',
  'tron',
  'chainlink',
  'polygon',
  'wrapped-bitcoin',
  'dai',
  'uniswap',
  'litecoin',
  'avalanche-2',
  'shiba-inu',
  'polkadot',
  'bitcoin-cash',
  'matic-network',
  'aave',
  'compound-governance-token',
  'maker',
  'the-graph',
  'curve-dao-token',
  'sushi',
  'yearn-finance',
  'pancakeswap-token',
  'synthetix-network-token',
];

const formatMarketCap = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

const formatVolume = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { favorites } = useFavorites();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '1m' | '1y'>('24h');
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume' | 'priceChange'>('marketCap');
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletInfo | null>(null);

  // Fetch tokens from CoinGecko
  const fetchTokens = async () => {
    try {
      console.log('Fetching top tokens from CoinGecko...');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      
      const formattedTokens: Token[] = data.map((coin: any, index: number) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price || 0,
        change: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        volume: coin.total_volume || 0,
        icon: coin.image || getTokenIconUrl(coin.symbol.toUpperCase()),
        rank: index + 1,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        priceChange24h: coin.price_change_24h,
      }));

      setTokens(formattedTokens);
      console.log(`Loaded ${formattedTokens.length} tokens`);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load active wallet
  const loadWallet = async () => {
    const wallet = await StorageService.getActiveWallet();
    setActiveWallet(wallet);
  };

  useEffect(() => {
    loadWallet();
    fetchTokens();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTokens();
  };

  // Filter tokens based on search
  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tokens
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    switch (sortBy) {
      case 'marketCap':
        return b.marketCap - a.marketCap;
      case 'volume':
        return b.volume - a.volume;
      case 'priceChange':
        return Math.abs(b.change) - Math.abs(a.change);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          address={activeWallet?.ethereumAddress || '0x0000000000000000'}
          walletName={activeWallet?.name}
          onSearchPress={() => navigation.navigate('Search')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF007A" />
          <Text style={styles.loadingText}>Loading tokens...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        address={activeWallet?.ethereumAddress || '0x0000000000000000'}
        walletName={activeWallet?.name}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF007A']} />
        }
      >
        {favorites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Favorites</Text>
            {favorites.map(token => (
              <TouchableOpacity
                key={token.id}
                style={styles.tokenCard}
                onPress={() => navigation.navigate('Token', { token })}
              >
                <View style={styles.tokenInfo}>
                  <View style={styles.tokenIcon}>
                    {token.icon ? (
                      <Image source={{ uri: token.icon }} style={styles.tokenIconImage} />
                    ) : (
                      <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                </View>
                <View style={styles.tokenValue}>
                  <Text style={styles.tokenPrice}>
                    ${typeof token.price === 'number' ? token.price.toFixed(2) : token.price}
                  </Text>
                  <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                    {token.change > 0 ? '+' : ''}{typeof token.change === 'number' ? token.change.toFixed(2) : token.change}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Charts</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.timeframeText}>Last {timeframe}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tokens..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.sortTabs}>
            <TouchableOpacity 
              style={[styles.sortTab, sortBy === 'marketCap' && styles.sortTabActive]}
              onPress={() => setSortBy('marketCap')}
            >
              <Text style={[styles.sortTabText, sortBy === 'marketCap' && styles.sortTabTextActive]}>
                Market cap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortTab, sortBy === 'volume' && styles.sortTabActive]}
              onPress={() => setSortBy('volume')}
            >
              <Text style={[styles.sortTabText, sortBy === 'volume' && styles.sortTabTextActive]}>
                Volume
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortTab, sortBy === 'priceChange' && styles.sortTabActive]}
              onPress={() => setSortBy('priceChange')}
            >
              <Text style={[styles.sortTabText, sortBy === 'priceChange' && styles.sortTabTextActive]}>
                Price change
              </Text>
            </TouchableOpacity>
          </View>

          {sortedTokens.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No tokens found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : (
            sortedTokens.map((token, index) => (
            <TouchableOpacity
              key={token.id}
              style={styles.tokenCard}
              onPress={() => navigation.navigate('Token', { token })}
            >
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenRank}>{index + 1}</Text>
                <View style={styles.tokenIcon}>
                  {token.icon ? (
                    <Image source={{ uri: token.icon }} style={styles.tokenIconImage} />
                  ) : (
                    <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                </View>
              </View>
              <View style={styles.tokenValue}>
                <Text style={styles.tokenPrice}>${token.price >= 1 ? token.price.toFixed(2) : token.price.toFixed(6)}</Text>
                <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                  {token.change > 0 ? '+' : ''}{token.change.toFixed(2)}%
                </Text>
                <View style={styles.tokenStats}>
                  <Text style={styles.tokenStat}>MC: {formatMarketCap(token.marketCap)}</Text>
                  <Text style={styles.tokenStat}>Vol: {formatVolume(token.volume)}</Text>
                </View>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  timeframeText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  sortTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  sortTabActive: {
    backgroundColor: '#FF007A',
  },
  sortTabText: {
    fontSize: 14,
    color: '#666',
  },
  sortTabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  tokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenRank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 12,
    minWidth: 24,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  tokenIconImage: {
    width: '100%',
    height: '100%',
  },
  tokenIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tokenValue: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
  },
  tokenChange: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  tokenStats: {
    marginTop: 4,
  },
  tokenStat: {
    fontSize: 11,
    color: '#999',
  },
});
