import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: string;
  balance: string;
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
  const [fromToken, setFromToken] = useState<Token>({
    id: '1',
    name: 'Ethereum',
    symbol: 'ETH',
    price: '1,800.00',
    balance: '0.5',
  });

  const [toToken, setToToken] = useState<Token>({
    id: '2',
    name: 'USD Coin',
    symbol: 'USDC',
    price: '1.00',
    balance: '1,000.00',
  });

  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const handleSwitch = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleSwap = useCallback(() => {
    if (!fromAmount || !toAmount) return;
    console.log('Swapping', fromAmount, fromToken.symbol, 'for', toAmount, toToken.symbol);
  }, [fromAmount, toAmount, fromToken.symbol, toToken.symbol]);

  return (
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
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.swapContainer}>
            <TokenInput
              label="From"
              token={fromToken}
              amount={fromAmount}
              onAmountChange={setFromAmount}
              onTokenSelect={() => {}}
            />

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={handleSwitch}
            >
              <Ionicons name="swap-vertical" size={24} color="#FF007A" />
            </TouchableOpacity>

            <TokenInput
              label="To"
              token={toToken}
              amount={toAmount}
              onAmountChange={setToAmount}
              onTokenSelect={() => {}}
            />
          </View>

          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>1 {fromToken.symbol} = 1,800 {toToken.symbol}</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum received</Text>
              <Text style={styles.detailValue}>1.756 {toToken.symbol}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price impact</Text>
              <Text style={styles.detailValue}>0.05%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network fee</Text>
              <Text style={styles.detailValue}>~$4.73</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.swapButton, (!fromAmount || !toAmount) && styles.swapButtonDisabled]}
          onPress={handleSwap}
          disabled={!fromAmount || !toAmount}
        >
          <LinearGradient
            colors={['#FF007A', '#FF4D4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.swapButtonGradient}
          >
            <Text style={styles.swapButtonText}>Swap</Text>
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
});
