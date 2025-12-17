import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../components/common/Card';

export const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTokens = [
    { symbol: 'ETH', name: 'Ethereum', price: '$1,800.00', change: '+2.5%' },
    { symbol: 'BTC', name: 'Bitcoin', price: '$42,000.00', change: '+1.8%' },
    { symbol: 'UNI', name: 'Uniswap', price: '$5.20', change: '-0.5%' },
    { symbol: 'LINK', name: 'Chainlink', price: '$15.80', change: '+3.2%' },
  ];

  const categories = [
    'DeFi', 'NFTs', 'Gaming', 'Layer 2', 'Metaverse'
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tokens and NFTs"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryButton}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>Trending</Text>
      {trendingTokens.map((token, index) => (
        <Card key={index} style={styles.tokenCard}>
          <View style={styles.tokenRow}>
            <View style={styles.tokenInfo}>
              <View style={styles.tokenIcon}>
                <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>{token.name}</Text>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.tokenPrice}>{token.price}</Text>
              <Text style={[
                styles.tokenChange,
                { color: token.change.startsWith('+') ? '#00C853' : '#FF4D4D' }
              ]}>
                {token.change}
              </Text>
            </View>
          </View>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>Popular Collections</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.collectionCard}>
            <View style={styles.collectionImagePlaceholder}>
              <Text style={styles.placeholderText}>NFT</Text>
            </View>
            <Text style={styles.collectionName}>Collection {item}</Text>
            <Text style={styles.collectionFloor}>Floor: 0.5 ETH</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  categoryText: {
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    margin: 16,
  },
  tokenCard: {
    marginHorizontal: 16,
    marginVertical: 8,
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
  },
  tokenChange: {
    marginTop: 4,
  },
  collectionCard: {
    width: 200,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  collectionImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#999',
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  collectionFloor: {
    color: '#666',
    marginTop: 4,
  },
});
