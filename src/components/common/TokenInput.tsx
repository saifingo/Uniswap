import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface TokenInputProps {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  token: {
    symbol: string;
    balance?: string;
  };
  onTokenPress: () => void;
}

export const TokenInput = ({ label, value, onChangeValue, token, onTokenPress }: TokenInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeValue}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.tokenButton} onPress={onTokenPress}>
          <Text style={styles.tokenSymbol}>{token.symbol}</Text>
        </TouchableOpacity>
      </View>
      {token.balance && (
        <Text style={styles.balance}>Balance: {token.balance} {token.symbol}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: '#000',
  },
  tokenButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  balance: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
