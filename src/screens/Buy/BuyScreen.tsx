import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';

export const BuyScreen = () => {
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');

  const paymentMethods = [
    { id: 'card', label: 'Credit Card', icon: 'credit-card' },
    { id: 'bank', label: 'Bank Transfer', icon: 'bank' },
    { id: 'apple', label: 'Apple Pay', icon: 'apple' },
    { id: 'google', label: 'Google Pay', icon: 'google' },
  ];

  const renderPaymentIcon = (icon: string) => {
    return (
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={selectedPayment === icon ? '#FFF' : '#666'}
        style={styles.paymentIcon}
      />
    );
  };

  const cryptoOptions = [
    { symbol: 'ETH', name: 'Ethereum', price: '1,800.00' },
    { symbol: 'BTC', name: 'Bitcoin', price: '42,000.00' },
    { symbol: 'USDT', name: 'Tether', price: '1.00' },
  ];

  return (
    <View style={styles.container}>
      <Card>
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
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.optionsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.optionButton,
                selectedPayment === method.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              {renderPaymentIcon(method.icon)}
              <Text style={[
                styles.optionText,
                selectedPayment === method.id && styles.optionTextSelected,
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Select Crypto</Text>
        {cryptoOptions.map((crypto) => (
          <TouchableOpacity
            key={crypto.symbol}
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
      </Card>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>You'll receive approximately</Text>
          <Text style={styles.summaryValue}>
            {amount ? (Number(amount) / Number(cryptoOptions.find(c => c.symbol === selectedCrypto)?.price.replace(',', ''))).toFixed(6) : '0'} {selectedCrypto}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network Fee</Text>
          <Text style={styles.summaryValue}>~$2.50</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.buyButton, !amount && styles.buyButtonDisabled]}
        disabled={!amount}
      >
        <Text style={styles.buyButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#000',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minWidth: '45%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paymentIcon: {
    marginRight: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#FF007A',
    borderColor: '#FF007A',
  },
  optionText: {
    textAlign: 'center',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  cryptoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cryptoOptionSelected: {
    borderColor: '#FF007A',
    backgroundColor: '#FFF5F9',
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoSymbol: {
    color: '#666',
    marginTop: 4,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  summary: {
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    padding: 16,
  },
  buyButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
