import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/common/Card';
import { PriceChart } from '../../components/charts/PriceChart';
import { Header } from '../../components/common/Header';

export const HomeScreen = ({ navigation }: any) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('D');
  const dummyData = {
    portfolio: {
      value: '2,650.32',
      change: -0.54,
    },
    chartData: {
      data: [100, 120, 115, 130, 125, 135, 130],
      labels: ['H', 'D', 'W', 'M', 'Y'],
    },
    tokens: [
      { name: 'Ether', symbol: 'ETH', balance: '0.213', value: '405.60', change: -0.54 },
      { name: 'Compound', symbol: 'COMP', balance: '14.32', value: '897.59', change: -1.56 },
      { name: 'Dai', symbol: 'DAI', balance: '50.13', value: '50.13', change: 0.00 },
      { name: 'Bitcoin', symbol: 'BTC', balance: '0.015', value: '650.00', change: 1.25 },
      { name: 'Chainlink', symbol: 'LINK', balance: '25.5', value: '382.50', change: 2.34 },
      { name: 'Uniswap', symbol: 'UNI', balance: '45.2', value: '225.10', change: -0.75 },
      { name: 'Polygon', symbol: 'MATIC', balance: '1250.0', value: '875.00', change: 3.15 },
    ],
  };

  const timeframes = [
    { id: 'H', label: 'Hour' },
    { id: 'D', label: 'Day' },
    { id: 'W', label: 'Week' },
    { id: 'Y', label: 'Year' },
  ];

  return (
    <View style={styles.container}>
      <Header
        address="0x1234567890abcdef"
        onAvatarPress={() => {}}
        onSearchPress={() => navigation.navigate('Search')}
      />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioValue}>${dummyData.portfolio.value}</Text>
            <Text style={[styles.change, { color: dummyData.portfolio.change < 0 ? '#FF4D4D' : '#00C853' }]}>
              {dummyData.portfolio.change}%
            </Text>
          </View>

          <PriceChart 
            data={dummyData.chartData.data}
            labels={dummyData.chartData.labels}
            color="#FF007A"
          />

          <View style={styles.timeframeContainer}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.id}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === tf.id && styles.timeframeButtonActive
                ]}
                onPress={() => setSelectedTimeframe(tf.id)}
              >
                <Text style={[
                  styles.timeframeText,
                  selectedTimeframe === tf.id && styles.timeframeTextActive
                ]}>{tf.id}</Text>
              </TouchableOpacity>
            ))}
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
        {dummyData.tokens.map((token, index) => (
          <Card key={index} style={styles.tokenCard}>
            <TouchableOpacity 
              style={styles.tokenRow}
              onPress={() => navigation.navigate('TokenDetails', { token })}
            >
              <View style={styles.tokenInfo}>
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
                </View>
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
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  portfolioCard: {
    marginBottom: 16,
  },
  portfolioHeader: {
    marginBottom: 16,
  },
  portfolioLabel: {
    fontSize: 16,
    color: '#666',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 4,
  },
  change: {
    fontSize: 16,
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
