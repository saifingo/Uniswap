import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../../components/common/Card';
import { TokenInput } from '../../components/common/TokenInput';

export const SwapScreen = () => {
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromToken, setFromToken] = useState({
    symbol: 'ETH',
    balance: '0.213',
  });
  const [toToken, setToToken] = useState({
    symbol: 'USDT',
    balance: '145.32',
  });

  const handleSwap = () => {
    // Implement swap functionality
    console.log('Swap initiated');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.swapCard}>
        <TokenInput
          label="From"
          value={fromValue}
          onChangeValue={setFromValue}
          token={fromToken}
          onTokenPress={() => console.log('Select FROM token')}
        />

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => {
            const tempToken = fromToken;
            setFromToken(toToken);
            setToToken(tempToken);
            const tempValue = fromValue;
            setFromValue(toValue);
            setToValue(tempValue);
          }}
        >
          <Text style={styles.switchIcon}>↑↓</Text>
        </TouchableOpacity>

        <TokenInput
          label="To"
          value={toValue}
          onChangeValue={setToValue}
          token={toToken}
          onTokenPress={() => console.log('Select TO token')}
        />

        <View style={styles.rateContainer}>
          <Text style={styles.rateText}>1 {fromToken.symbol} = 1,800 {toToken.symbol}</Text>
        </View>
      </Card>

      <TouchableOpacity 
        style={[
          styles.swapButton,
          (!fromValue || !toValue) && styles.swapButtonDisabled
        ]}
        onPress={handleSwap}
        disabled={!fromValue || !toValue}
      >
        <Text style={styles.swapButtonText}>Swap</Text>
      </TouchableOpacity>

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Minimum received</Text>
          <Text style={styles.detailValue}>1,790 {toToken.symbol}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price Impact</Text>
          <Text style={styles.detailValue}>{'< 0.01%'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Fee</Text>
          <Text style={styles.detailValue}>~$2.50</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  swapCard: {
    marginTop: 8,
  },
  switchButton: {
    alignSelf: 'center',
    padding: 8,
    marginVertical: 8,
  },
  switchIcon: {
    fontSize: 20,
    color: '#FF007A',
  },
  rateContainer: {
    marginTop: 16,
    padding: 8,
  },
  rateText: {
    fontSize: 14,
    color: '#666',
  },
  swapButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    padding: 16,
    marginVertical: 16,
  },
  swapButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  swapButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
});
