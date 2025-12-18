import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: number;
}

const INITIAL_TOKENS: Token[] = [
  { id: '1', symbol: 'ETH', name: 'Ethereum', price: '1,800.00', change: 2.5 },
  { id: '2', symbol: 'BTC', name: 'Bitcoin', price: '42,000.00', change: 1.8 },
  { id: '3', symbol: 'USDT', name: 'Tether', price: '1.00', change: 0.0 },
  { id: '4', symbol: 'BNB', name: 'Binance Coin', price: '240.50', change: -1.2 },
  { id: '5', symbol: 'XRP', name: 'Ripple', price: '0.50', change: 3.4 },
];

type SearchScreenProps = {
  navigation: any;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simulated token data - replace with actual API call
  const searchTokens = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const filteredTokens = INITIAL_TOKENS.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setTokens(filteredTokens);
    } catch (error) {
      console.error('Error searching tokens:', error);
      setError('Failed to search tokens. Please try again.');
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const debounce = setTimeout(() => {
        searchTokens(query);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setTokens([]);
    }
  }, [query, searchTokens]);

  const renderToken: ListRenderItem<Token> = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.tokenItem}
      onPress={() => navigation.navigate('Token', { token: item })}
    >
      <View style={styles.tokenInfo}>
        <View style={styles.tokenIcon}>
          <Text style={styles.tokenIconText}>{item.symbol[0]}</Text>
        </View>
        <View>
          <Text style={styles.tokenName}>{item.name}</Text>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
        </View>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.tokenPrice}>${item.price}</Text>
        <Text style={[
          styles.tokenChange,
          { color: item.change >= 0 ? '#00C853' : '#FF4D4D' }
        ]}>
          {item.change > 0 ? '+' : ''}{item.change}%
        </Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const keyExtractor = useCallback((item: Token) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search tokens"
              placeholderTextColor="#999"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color="#FF007A" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={tokens}
            renderItem={renderToken}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              query.length > 0 ? (
                <Text style={styles.noResults}>No tokens found</Text>
              ) : (
                <Text style={styles.placeholder}>Search for tokens by name or symbol</Text>
              )
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            onEndReachedThreshold={0.5}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
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
    color: '#000',
  },
  tokenSymbol: {
    color: '#666',
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tokenChange: {
    marginTop: 4,
  },
  loader: {
    marginTop: 32,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF4D4D',
    marginTop: 32,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  placeholder: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 16,
  },
});
