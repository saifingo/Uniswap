import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common/Card';
import { PriceChart } from '../../components/charts/PriceChart';

export const TokenDetailsScreen = () => {
  const tokenData = {
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$1,800.00',
    change: '+2.5%',
    marketCap: '$219.8B',
    volume24h: '$12.5B',
    high24h: '$1,850.00',
    low24h: '$1,780.00',
    chartData: {
      data: [1800, 1820, 1810, 1830, 1825, 1835, 1830],
      labels: ['1H', '1D', '1W', '1M', '1Y'],
    },
  };

  const timeFrames = ['1H', '1D', '1W', '1M', '1Y'];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tokenInfo}>
          <View style={styles.tokenIcon}>
            <Text style={styles.tokenIconText}>{tokenData.symbol[0]}</Text>
          </View>
          <View>
            <Text style={styles.tokenName}>{tokenData.name}</Text>
            <Text style={styles.tokenSymbol}>{tokenData.symbol}</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.tokenPrice}>{tokenData.price}</Text>
          <Text style={[
            styles.priceChange,
            { color: tokenData.change.startsWith('+') ? '#00C853' : '#FF4D4D' }
          ]}>
            {tokenData.change}
          </Text>
        </View>
      </View>

      <Card>
        <PriceChart
          data={tokenData.chartData.data}
          labels={tokenData.chartData.labels}
        />
        <View style={styles.timeFrames}>
          {timeFrames.map((frame, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeFrameButton,
                frame === '1D' && styles.timeFrameButtonActive
              ]}
            >
              <Text style={[
                styles.timeFrameText,
                frame === '1D' && styles.timeFrameTextActive
              ]}>
                {frame}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Market Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>{tokenData.marketCap}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume 24h</Text>
            <Text style={styles.statValue}>{tokenData.volume24h}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h High</Text>
            <Text style={styles.statValue}>{tokenData.high24h}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h Low</Text>
            <Text style={styles.statValue}>{tokenData.low24h}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.buyButton]}>
          <Text style={styles.actionButtonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.sellButton]}>
          <Text style={styles.actionButtonText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
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
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '600',
  },
  priceChange: {
    marginTop: 4,
    fontWeight: '500',
  },
  timeFrames: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  timeFrameButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timeFrameButtonActive: {
    backgroundColor: '#FF007A',
  },
  timeFrameText: {
    color: '#666',
    fontWeight: '500',
  },
  timeFrameTextActive: {
    color: '#FFF',
  },
  statsCard: {
    margin: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    marginHorizontal: 8,
  },
  buyButton: {
    backgroundColor: '#FF007A',
  },
  sellButton: {
    backgroundColor: '#FF4D4D',
  },
  actionButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
