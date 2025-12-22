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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../../context/FavoritesContext';
import { StorageService } from '../../services/storage';
import { EthereumService } from '../../services/ethereumService';
import { SolanaService } from '../../services/solanaService';

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

interface UserPosition {
  balance: number;
  usdValue: number;
  pnl24h: number;
  pnlPercentage: number;
}

const screenWidth = Dimensions.get('window').width;

export const TokenDetailsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { token } = route.params;
  const [timeframe, setTimeframe] = useState<'H' | 'D' | 'W' | 'M' | 'Y'>('D');
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isTokenFavorite, setIsTokenFavorite] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [{ data: [] }] });
  const [loadingChart, setLoadingChart] = useState(true);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loadingPosition, setLoadingPosition] = useState(true);

  useEffect(() => {
    setIsTokenFavorite(isFavorite(token.id));
  }, [isFavorite, token.id]);

  useEffect(() => {
    loadChartData();
  }, [timeframe, token]);

  useEffect(() => {
    loadUserPosition();
  }, [token]);

  const loadChartData = async () => {
    try {
      setLoadingChart(true);
      
      const days = {
        'H': 1,
        'D': 1,
        'W': 7,
        'M': 30,
        'Y': 365,
      }[timeframe];

      const coinId = token.id || token.symbol.toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) {
        console.log('Failed to fetch chart data');
        return;
      }
      
      const data = await response.json();
      const prices = data.prices || [];
      
      let chartPrices: number[] = [];
      let chartLabels: string[] = [];
      
      if (timeframe === 'H') {
        const filtered = prices.filter((_: any, i: number) => i % 4 === 0);
        chartPrices = filtered.map((p: any) => p[1]);
        chartLabels = filtered.map((p: any) => {
          const date = new Date(p[0]);
          return date.getHours() + 'h';
        });
      } else if (timeframe === 'D') {
        const filtered = prices.filter((_: any, i: number) => i % 3 === 0);
        chartPrices = filtered.map((p: any) => p[1]);
        chartLabels = filtered.map((p: any) => {
          const date = new Date(p[0]);
          return date.getHours() + 'h';
        });
      } else if (timeframe === 'W') {
        chartPrices = prices.map((p: any) => p[1]);
        chartLabels = prices.map((p: any) => {
          const date = new Date(p[0]);
          return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        });
      } else if (timeframe === 'M') {
        const filtered = prices.filter((_: any, i: number) => i % 5 === 0);
        chartPrices = filtered.map((p: any) => p[1]);
        chartLabels = filtered.map((p: any) => {
          const date = new Date(p[0]);
          return (date.getMonth() + 1) + '/' + date.getDate();
        });
      } else {
        const filtered = prices.filter((_: any, i: number) => i % 30 === 0);
        chartPrices = filtered.map((p: any) => p[1]);
        chartLabels = filtered.map((p: any) => {
          const date = new Date(p[0]);
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        });
      }
      
      setChartData({
        labels: chartLabels.slice(0, 7),
        datasets: [{ data: chartPrices.slice(0, 7) }],
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const loadUserPosition = async () => {
    try {
      setLoadingPosition(true);
      const wallet = await StorageService.getActiveWallet();
      if (!wallet) {
        setUserPosition(null);
        return;
      }

      let balance = 0;
      const symbol = token.symbol.toUpperCase();

      if (symbol === 'ETH') {
        balance = await EthereumService.getEthBalance(wallet.ethereumAddress);
      } else if (symbol === 'SOL') {
        balance = await SolanaService.getSolBalance(wallet.solanaAddress);
      } else {
        const ethTokens = await EthereumService.getTokenBalances(wallet.ethereumAddress);
        const tokenData = ethTokens.find((t: any) => t.symbol.toUpperCase() === symbol);
        if (tokenData) {
          balance = parseFloat(tokenData.balance);
        }
      }

      if (balance > 0) {
        const currentPrice = parseFloat(token.price.replace(/,/g, ''));
        const usdValue = balance * currentPrice;
        
        const pnlPercentage = token.change || 0;
        const pnl24h = (usdValue * pnlPercentage) / 100;
        
        setUserPosition({
          balance,
          usdValue,
          pnl24h,
          pnlPercentage,
        });
      } else {
        setUserPosition(null);
      }
    } catch (error) {
      console.error('Error loading user position:', error);
      setUserPosition(null);
    } finally {
      setLoadingPosition(false);
    }
  };

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
          {loadingChart ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color="#FF007A" />
              <Text style={styles.loadingText}>Loading chart...</Text>
            </View>
          ) : chartData.datasets[0].data.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                decimalPlaces: 0,
                color: () => token.change < 0 ? '#FF4D4D' : '#00C853',
                labelColor: () => '#666',
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: token.change < 0 ? '#FF4D4D' : '#00C853',
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          ) : (
            <View style={styles.chartLoading}>
              <Text style={styles.loadingText}>No chart data available</Text>
            </View>
          )}

          <View style={styles.timeframes}>
            {['H', 'D', 'W', 'M', 'Y'].map((frame) => (
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

        {loadingPosition ? (
          <View style={styles.holdingCard}>
            <ActivityIndicator size="small" color="#FF007A" />
          </View>
        ) : userPosition ? (
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
                <Text style={styles.holdingValue}>
                  {userPosition.balance.toFixed(6)} {token.symbol}
                </Text>
              </View>
              <Text style={styles.holdingUsdValue}>
                ${userPosition.usdValue.toFixed(2)}
              </Text>
            </View>
            <View style={styles.pnlContainer}>
              <Text style={styles.pnlLabel}>24h PnL</Text>
              <View style={styles.pnlValues}>
                <Text style={[styles.pnlAmount, { color: userPosition.pnl24h >= 0 ? '#00C853' : '#FF4D4D' }]}>
                  {userPosition.pnl24h >= 0 ? '+' : ''}${Math.abs(userPosition.pnl24h).toFixed(2)}
                </Text>
                <Text style={[styles.pnlPercentage, { color: userPosition.pnlPercentage >= 0 ? '#00C853' : '#FF4D4D' }]}>
                  ({userPosition.pnlPercentage >= 0 ? '+' : ''}{userPosition.pnlPercentage.toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => navigation.navigate('Receive', { token })}
          >
            <Ionicons name="download-outline" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Receive</Text>
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
  pnlContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pnlLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pnlValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pnlAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  pnlPercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartLoading: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
