import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../../context/FavoritesContext';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: number;
  marketCap?: string;
  volume?: string;
  icon?: string;
  description?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

const CHART_DATA: ChartData = {
  labels: ['H', 'D', 'W', 'Y'],
  datasets: [{
    data: [20, 45, 28, 80, 99, 43],
  }],
};

const screenWidth = Dimensions.get('window').width;

export const TokenDetailsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { token } = route.params;
  const [timeframe, setTimeframe] = useState<'H' | 'D' | 'W' | 'Y'>('D');
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isTokenFavorite, setIsTokenFavorite] = useState(false);

  useEffect(() => {
    setIsTokenFavorite(isFavorite(token.id));
  }, [isFavorite, token.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => {
            if (isTokenFavorite) {
              removeFavorite(token.id);
            } else {
              addFavorite(token);
            }
            setIsTokenFavorite(!isTokenFavorite);
          }}
        >
          <Ionicons 
            name={isTokenFavorite ? 'star' : 'star-outline'}
            size={24}
            color="#FF007A"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tokenHeader}>
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
          <View style={styles.priceInfo}>
            <Text style={styles.tokenPrice}>${token.price}</Text>
            <Text style={[styles.tokenChange, { color: token.change < 0 ? '#FF4D4D' : '#00C853' }]}>
              {token.change > 0 ? '+' : ''}{token.change}%
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <LineChart
            data={CHART_DATA}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FFF',
              backgroundGradientTo: '#FFF',
              decimalPlaces: 2,
              color: () => '#FF007A',
              labelColor: () => '#666',
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF007A',
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
          />

          <View style={styles.timeframes}>
            {['H', 'D', 'W', 'Y'].map((frame) => (
              <TouchableOpacity
                key={frame}
                style={[styles.timeframe, timeframe === frame && styles.timeframeActive]}
                onPress={() => setTimeframe(frame as typeof timeframe)}
              >
                <Text style={[styles.timeframeText, timeframe === frame && styles.timeframeTextActive]}>
                  {frame}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.holdingCard}>
          <Text style={styles.holdingTitle}>My position</Text>
          <View style={styles.holdingInfo}>
            <View style={styles.holdingAmount}>
              <View style={styles.tokenIconSmall}>
                {token.icon ? (
                  <Image source={{ uri: token.icon }} style={styles.tokenIconImage} />
                ) : (
                  <Text style={styles.tokenIconTextSmall}>{token.symbol[0]}</Text>
                )}
              </View>
              <Text style={styles.holdingValue}>21.246 {token.symbol}</Text>
            </View>
            <Text style={styles.holdingUsdValue}>$351.91</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => navigation.navigate('Buy', { token })}
          >
            <Ionicons name="card" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.swapButton]}
            onPress={() => navigation.navigate('Swap', { token })}
          >
            <Ionicons name="swap-horizontal" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Swap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            {token.description || `${token.name} (${token.symbol}) is an Ethereum token that powers ${token.name}, an automated liquidity provider that's designed to make it easy to exchange Ethereum (ERC-20) tokens. There is no orderbook or central facilitator on Uniswap. Instead, tokens are exchanged through liquidity pools that are defined by smart contracts.`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  tokenHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 20,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  tokenSymbol: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  tokenChange: {
    fontSize: 16,
    marginTop: 4,
  },
  chartContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  timeframes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  timeframe: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  timeframeActive: {
    backgroundColor: '#FF007A',
  },
  timeframeText: {
    fontSize: 16,
    color: '#666',
  },
  timeframeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  holdingCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  holdingTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  holdingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  holdingAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  tokenIconTextSmall: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  holdingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  holdingUsdValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    gap: 8,
  },
  buyButton: {
    backgroundColor: '#FF007A',
  },
  swapButton: {
    backgroundColor: '#FF007A',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  aboutSection: {
    padding: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
