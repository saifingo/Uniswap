import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onScanPress: () => void;
  error?: string;
}

export const AddressInput = ({ value, onChangeText, onScanPress, error }: AddressInputProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter wallet address or ENS"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
          <Text style={styles.scanText}>Scan</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  scanButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  scanText: {
    color: '#FF007A',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
