import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/common/Card';
import { TokenInput } from '../../components/common/TokenInput';
import { AddressInput } from '../../components/common/AddressInput';

export const SendScreen = () => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState({
    symbol: 'ETH',
    balance: '0.213',
  });

  const recentAddresses = [
    { address: '0x1234...5678', name: 'John.eth' },
    { address: '0x8765...4321', name: 'Alice.eth' },
    { address: '0x9876...1234', name: 'Bob.eth' },
  ];

  const validateAddress = (addr: string) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(addr) || addr.toLowerCase().endsWith('.eth');
  };

  const handleSend = () => {
    if (!validateAddress(address)) {
      // Show error
      return;
    }
    // Implement send functionality
    console.log('Send initiated');
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <AddressInput
          value={address}
          onChangeText={setAddress}
          onScanPress={() => console.log('Open QR scanner')}
          error={address && !validateAddress(address) ? 'Invalid address' : undefined}
        />

        <TokenInput
          label="Amount"
          value={amount}
          onChangeValue={setAmount}
          token={selectedToken}
          onTokenPress={() => console.log('Select token')}
        />

        <TouchableOpacity style={styles.maxButton}>
          <Text style={styles.maxButtonText}>MAX</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.recentCard}>
        <Text style={styles.recentTitle}>Recent</Text>
        {recentAddresses.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={() => setAddress(item.address)}
          >
            <View style={styles.addressIcon}>
              <Text style={styles.addressIconText}>
                {item.name[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.addressName}>{item.name}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Network Fee</Text>
          <Text style={styles.summaryValue}>~$2.50</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.sendButton,
          (!amount || !address) && styles.sendButtonDisabled
        ]}
        onPress={handleSend}
        disabled={!amount || !address}
      >
        <Text style={styles.sendButtonText}>Send {selectedToken.symbol}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  maxButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 8,
  },
  maxButtonText: {
    color: '#FF007A',
    fontWeight: '600',
    fontSize: 12,
  },
  recentCard: {
    marginTop: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF007A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressIconText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressText: {
    color: '#666',
    marginTop: 4,
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
  sendButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    padding: 16,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
