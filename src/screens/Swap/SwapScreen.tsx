import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../../services/storage';
import { EthereumService } from '../../services/ethereumService';
import { SolanaService } from '../../services/solanaService';
import { PriceService } from '../../services/priceService';
import { getTokenIconUrl } from '../../services/tokenIconService';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  balance: string;
  logo?: string;
  address?: string;
  chain: 'ethereum' | 'solana';
  decimals?: number;
}

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  onAmountChange: (value: string) => void;
  onTokenSelect: () => void;
}

const TokenInput: React.FC<TokenInputProps> = ({
  label,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
}) => (
  <View style={styles.inputCard}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <TouchableOpacity style={styles.tokenSelector} onPress={onTokenSelect}>
        <View style={styles.tokenIcon}>
          <Text style={styles.tokenIconText}>{token.symbol[0]}</Text>
        </View>
        <Text style={styles.tokenSymbol}>{token.symbol}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
      <View style={styles.amountContainer}>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#999"
        />
        <Text style={styles.amountUSD}>${token.price}</Text>
      </View>
    </View>
    <Text style={styles.balanceText}>Balance: {token.balance} {token.symbol}</Text>
  </View>
);

export const SwapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [estimatingQuote, setEstimatingQuote] = useState(false);
  const [gasEstimate, setGasEstimate] = useState('0.00');
  const [priceImpact, setPriceImpact] = useState('0.00');
  const [exchangeRate, setExchangeRate] = useState('0');

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      estimateSwapQuote();
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const wallet = await StorageService.getActiveWallet();
      if (!wallet) return;

      const allTokens: Token[] = [];

      const ethBalance = await EthereumService.getEthBalance(wallet.ethereumAddress);
      const ethPriceData = await PriceService.getTokenPrice('ethereum');
      
      allTokens.push({
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        price: ethPriceData?.current_price || 0,
        balance: ethBalance.toFixed(6),
        logo: getTokenIconUrl('ETH'),
        chain: 'ethereum',
        decimals: 18,
      });

      const solBalance = await SolanaService.getSolBalance(wallet.solanaAddress);
      const solPriceData = await PriceService.getTokenPrice('solana');
      
      allTokens.push({
        id: 'sol',
        name: 'Solana',
        symbol: 'SOL',
        price: solPriceData?.current_price || 0,
        balance: solBalance.toFixed(6),
        logo: getTokenIconUrl('SOL'),
        chain: 'solana',
        decimals: 9,
      });

      const ethTokens = await EthereumService.getTokenBalances(wallet.ethereumAddress);
      const symbols = ethTokens.map((t: any) => t.symbol.toLowerCase());
      const prices = await PriceService.getMultiplePrices(symbols);
      
      ethTokens.forEach((token: any) => {
        if (parseFloat(token.balance) > 0) {
          const priceData = prices[token.symbol.toLowerCase()];
          allTokens.push({
            id: token.contractAddress,
            symbol: token.symbol,
            name: token.name,
            balance: parseFloat(token.balance).toFixed(6),
            price: priceData?.current_price || 0,
            logo: getTokenIconUrl(token.symbol, token.contractAddress, 'ethereum'),
            address: token.contractAddress,
            chain: 'ethereum',
            decimals: token.decimals || 18,
          });
        }
      });

      setTokens(allTokens);
      if (allTokens.length > 0) {
        setFromToken(allTokens[0]);
        if (allTokens.length > 1) {
          setToToken(allTokens[1]);
        }
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimateSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;
    
    try {
      setEstimatingQuote(true);
      
      const fromValue = parseFloat(fromAmount);
      const rate = toToken.price / fromToken.price;
      const estimatedTo = fromValue * rate;
      
      setToAmount(estimatedTo.toFixed(6));
      setExchangeRate(rate.toFixed(6));
      
      const impact = Math.abs((rate - 1) * 100);
      setPriceImpact(impact.toFixed(2));
      
      if (fromToken.chain === 'ethereum') {
        const gasPrice = await EthereumService.getGasPrice();
        const gasLimit = 200000;
        const gasCost = (gasPrice * gasLimit) / 1e18;
        const ethPriceData = await PriceService.getTokenPrice('ethereum');
        const gasCostUSD = gasCost * (ethPriceData?.current_price || 0);
        setGasEstimate(gasCostUSD.toFixed(2));
      } else {
        setGasEstimate('0.01');
      }
    } catch (error) {
      console.error('Error estimating quote:', error);
    } finally {
      setEstimatingQuote(false);
    }
  };

  const handleSwitch = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleFromAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleMaxAmount = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      Alert.alert('Error', 'Please enter valid amounts');
      return;
    }

    if (parseFloat(fromAmount) > parseFloat(fromToken.balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Swap',
      `Swap ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}?\n\nPrice Impact: ${priceImpact}%\nNetwork Fee: $${gasEstimate}\nSlippage: ${slippage}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Swap',
          onPress: async () => {
            try {
              setSwapping(true);
              
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              Alert.alert(
                '✅ Swap Successful!',
                `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!\n\nNote: Full swap execution requires DEX integration (Uniswap/Jupiter).`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setFromAmount('');
                      setToAmount('');
                      loadTokens();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('❌ Swap Failed', error.message || 'Transaction failed');
            } finally {
              setSwapping(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF007A" />
          <Text style={styles.loadingText}>Loading tokens...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
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
            <Text style={styles.title}>Swap</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.swapContainer}>
              {/* From Token */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>From</Text>
                  <TouchableOpacity onPress={handleMaxAmount}>
                    <Text style={styles.maxButton}>MAX</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={styles.tokenSelector} 
                    onPress={() => setShowFromSelector(true)}
                  >
                    {fromToken?.logo && (
                      <Image source={{ uri: fromToken.logo }} style={styles.tokenLogo} />
                    )}
                    <Text style={styles.tokenSymbol}>{fromToken?.symbol || 'Select'}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.amountContainer}>
                    <TextInput
                      style={styles.amountInput}
                      value={fromAmount}
                      onChangeText={handleFromAmountChange}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.amountUSD}>
                      ${fromToken && fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.balanceText}>
                  Balance: {fromToken?.balance || '0.00'} {fromToken?.symbol || ''}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.switchButton}
                onPress={handleSwitch}
              >
                <Ionicons name="swap-vertical" size={24} color="#FF007A" />
              </TouchableOpacity>

              {/* To Token */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>To</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={styles.tokenSelector}
                    onPress={() => setShowToSelector(true)}
                  >
                    {toToken?.logo && (
                      <Image source={{ uri: toToken.logo }} style={styles.tokenLogo} />
                    )}
                    <Text style={styles.tokenSymbol}>{toToken?.symbol || 'Select'}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.amountContainer}>
                    <View style={styles.toAmountContainer}>
                      {estimatingQuote ? (
                        <ActivityIndicator size="small" color="#FF007A" />
                      ) : (
                        <Text style={styles.amountInput}>{toAmount || '0.00'}</Text>
                      )}
                    </View>
                    <Text style={styles.amountUSD}>
                      ${toToken && toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.balanceText}>
                  Balance: {toToken?.balance || '0.00'} {toToken?.symbol || ''}
                </Text>
              </View>
            </View>

            {fromToken && toToken && exchangeRate !== '0' && (
              <View style={styles.rateContainer}>
                <Text style={styles.rateText}>
                  1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                </Text>
              </View>
            )}

            {fromAmount && toAmount && (
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minimum received</Text>
                  <Text style={styles.detailValue}>
                    {(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken?.symbol}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price impact</Text>
                  <Text style={[styles.detailValue, { color: parseFloat(priceImpact) > 5 ? '#FF4D4D' : '#00C853' }]}>
                    {priceImpact}%
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Network fee</Text>
                  <Text style={styles.detailValue}>~${gasEstimate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Slippage tolerance</Text>
                  <Text style={styles.detailValue}>{slippage}%</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={[
              styles.swapButton, 
              (!fromAmount || !toAmount || swapping) && styles.swapButtonDisabled
            ]}
            onPress={handleSwap}
            disabled={!fromAmount || !toAmount || swapping}
          >
            <LinearGradient
              colors={['#FF007A', '#FF4D4D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.swapButtonGradient}
            >
              {swapping ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.swapButtonText}>Swap</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* From Token Selector Modal */}
      <Modal
        visible={showFromSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFromSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Token</Text>
              <TouchableOpacity onPress={() => setShowFromSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tokenList}>
              {tokens.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenItem}
                  onPress={() => {
                    setFromToken(token);
                    setShowFromSelector(false);
                  }}
                >
                  {token.logo && (
                    <Image source={{ uri: token.logo }} style={styles.tokenItemLogo} />
                  )}
                  <View style={styles.tokenItemInfo}>
                    <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenItemName}>{token.name}</Text>
                  </View>
                  <View style={styles.tokenItemBalance}>
                    <Text style={styles.tokenItemBalanceText}>{token.balance}</Text>
                    <Text style={styles.tokenItemBalanceUSD}>
                      ${(parseFloat(token.balance) * token.price).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* To Token Selector Modal */}
      <Modal
        visible={showToSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowToSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Token</Text>
              <TouchableOpacity onPress={() => setShowToSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tokenList}>
              {tokens.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenItem}
                  onPress={() => {
                    setToToken(token);
                    setShowToSelector(false);
                  }}
                >
                  {token.logo && (
                    <Image source={{ uri: token.logo }} style={styles.tokenItemLogo} />
                  )}
                  <View style={styles.tokenItemInfo}>
                    <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenItemName}>{token.name}</Text>
                  </View>
                  <View style={styles.tokenItemBalance}>
                    <Text style={styles.tokenItemBalanceText}>{token.balance}</Text>
                    <Text style={styles.tokenItemBalanceUSD}>
                      ${(parseFloat(token.balance) * token.price).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Swap Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsContent}>
              <Text style={styles.settingsLabel}>Slippage Tolerance</Text>
              <View style={styles.slippageButtons}>
                {['0.1', '0.5', '1.0'].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.slippageButton,
                      slippage === value && styles.slippageButtonActive,
                    ]}
                    onPress={() => setSlippage(value)}
                  >
                    <Text
                      style={[
                        styles.slippageButtonText,
                        slippage === value && styles.slippageButtonTextActive,
                      ]}
                    >
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.customSlippage}>
                <TextInput
                  style={styles.customSlippageInput}
                  value={slippage}
                  onChangeText={setSlippage}
                  keyboardType="decimal-pad"
                  placeholder="Custom"
                  placeholderTextColor="#999"
                />
                <Text style={styles.customSlippageLabel}>%</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  swapContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tokenIconText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  amountContainer: {
    flex: 1,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
  },
  amountUSD: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
  },
  switchButton: {
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    marginVertical: -12,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rateContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  rateText: {
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  swapButton: {
    margin: 16,
    borderRadius: 30,
    overflow: 'hidden',
  },
  swapButtonDisabled: {
    opacity: 0.5,
  },
  swapButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  swapButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maxButton: {
    color: '#FF007A',
    fontSize: 14,
    fontWeight: '600',
  },
  tokenLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  toAmountContainer: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tokenList: {
    padding: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  tokenItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenItemInfo: {
    flex: 1,
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenItemName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tokenItemBalance: {
    alignItems: 'flex-end',
  },
  tokenItemBalanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenItemBalanceUSD: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  settingsContent: {
    padding: 20,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  slippageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  slippageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  slippageButtonActive: {
    backgroundColor: '#FF007A',
  },
  slippageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  slippageButtonTextActive: {
    color: '#FFF',
  },
  customSlippage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  customSlippageInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  customSlippageLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});
