import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: number;
  marketCap?: string;
  volume?: string;
  icon?: string;
}

const INITIAL_TOKENS: Token[] = [
  {
    id: '1',
    name: 'Ether',
    symbol: 'ETH',
    price: '1,900.00',
    change: -0.28,
    marketCap: '230B',
    volume: '12.5B',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: '2',
    name: 'Uniswap',
    symbol: 'UNI',
    price: '16.57',
    change: -1.56,
    marketCap: '5.2B',
    volume: '245M',
    icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  },
  {
    id: '3',
    name: 'ChainLink',
    symbol: 'LINK',
    price: '15.58',
    change: 1.11,
    marketCap: '7.8B',
    volume: '456M',
    icon: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  },
  {
    id: '4',
    name: 'Compound',
    symbol: 'COMP',
    price: '379.22',
    change: 0.08,
    marketCap: '2.1B',
    volume: '198M',
    icon: 'https://cryptologos.cc/logos/compound-comp-logo.png',
  },
  {
    id: '5',
    name: 'Aave',
    symbol: 'AAVE',
    price: '255.01',
    change: -0.22,
    marketCap: '3.3B',
    volume: '289M',
    icon: 'https://cryptologos.cc/logos/aave-aave-logo.png',
  },
];

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { favorites } = useFavorites();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '1m' | '1y'>('24h');
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume' | 'priceChange'>('marketCap');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = INITIAL_TOKENS.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        address="0x1234567890abcdef"
        onAvatarPress={() => {}}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView style={styles.content}>
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
                  <Text style={styles.tokenPrice}>${token.price}</Text>
                  <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                    {token.change > 0 ? '+' : ''}{token.change}%
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

          {filteredTokens.map((token, index) => (
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
                <Text style={styles.tokenPrice}>${token.price}</Text>
                <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                  {token.change > 0 ? '+' : ''}{token.change}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
});
