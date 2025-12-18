import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  price: string;
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'credit', label: 'Credit Card', icon: 'credit-card' },
  { id: 'bank', label: 'Bank Transfer', icon: 'bank' },
  { id: 'apple', label: 'Apple Pay', icon: 'apple' },
  { id: 'google', label: 'Google Pay', icon: 'google' },
];

const CRYPTO_OPTIONS: CryptoOption[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: '1,800.00',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '42,000.00',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    price: '1.00',
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    price: '1.00',
  },
  {
    id: 'dai',
    name: 'Dai',
    symbol: 'DAI',
    price: '1.00',
  },
];

export const BuyScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [filteredCryptos, setFilteredCryptos] = useState(CRYPTO_OPTIONS);

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
          <Text style={styles.title}>Buy Crypto</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.label}>Amount (USD)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <View style={styles.paymentGrid}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    selectedPayment === method.id && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <MaterialCommunityIcons
                    name={method.icon as any}
                    size={24}
                    color={selectedPayment === method.id ? '#FFF' : '#666'}
                  />
                  <Text style={[
                    styles.paymentLabel,
                    selectedPayment === method.id && styles.paymentLabelSelected,
                  ]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Crypto</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search cryptocurrencies..."
                placeholderTextColor="#999"
                onChangeText={(text) => {
                  const filtered = CRYPTO_OPTIONS.filter(crypto =>
                    crypto.name.toLowerCase().includes(text.toLowerCase()) ||
                    crypto.symbol.toLowerCase().includes(text.toLowerCase())
                  );
                  setFilteredCryptos(filtered);
                }}
              />
              <Ionicons name="search" size={20} color="#666" />
            </View>
            <ScrollView 
              style={styles.cryptoList}
              showsVerticalScrollIndicator={false}
            >
              {filteredCryptos.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={[
                    styles.cryptoOption,
                    selectedCrypto === crypto.symbol && styles.cryptoOptionSelected,
                  ]}
                  onPress={() => setSelectedCrypto(crypto.symbol)}
                >
                  <View>
                    <Text style={styles.cryptoName}>{crypto.name}</Text>
                    <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                  </View>
                  <Text style={styles.cryptoPrice}>${crypto.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>You'll receive approximately</Text>
              <Text style={styles.summaryValue}>
                {amount ? (Number(amount) / Number(CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto)?.price.replace(',', ''))).toFixed(6) : '0'} {selectedCrypto}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Network Fee</Text>
              <Text style={styles.summaryValue}>~$2.50</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.buyButton, !amount && styles.buyButtonDisabled]}
          disabled={!amount}
        >
          <Text style={styles.buyButtonText}>Continue to Payment</Text>
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
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentOption: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentOptionSelected: {
    backgroundColor: '#FF007A',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentLabelSelected: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    color: '#000',
  },
  cryptoList: {
    maxHeight: 300,
  },
  cryptoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  cryptoOptionSelected: {
    backgroundColor: '#FFF5F9',
    borderWidth: 1,
    borderColor: '#FF007A',
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cryptoSymbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  buyButton: {
    backgroundColor: '#FF007A',
    borderRadius: 30,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
