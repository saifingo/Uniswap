import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../../components/common/Card';
import { PriceChart } from '../../components/charts/PriceChart';

export const HomeScreen = () => {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.portfolioLabel}>Portfolio</Text>
        <Text style={styles.portfolioValue}>${dummyData.portfolio.value}</Text>
        <Text style={[styles.change, { color: dummyData.portfolio.change < 0 ? '#FF4D4D' : '#00C853' }]}>
          {dummyData.portfolio.change}%
        </Text>
      </View>

      <Card>
        <PriceChart 
          data={dummyData.chartData.data}
          labels={dummyData.chartData.labels}
        />
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Tokens</Text>
      {dummyData.tokens.map((token, index) => (
        <Card key={index}>
          <View style={styles.tokenRow}>
            <View>
              <Text style={styles.tokenName}>{token.name}</Text>
              <Text style={styles.tokenBalance}>{token.balance} {token.symbol}</Text>
            </View>
            <View style={styles.tokenValue}>
              <Text style={styles.tokenPrice}>${token.value}</Text>
              <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
                {token.change}%
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
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
    backgroundColor: '#FF007A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
