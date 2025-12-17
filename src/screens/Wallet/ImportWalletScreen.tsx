import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { ethers } from 'ethers';

export const ImportWalletScreen = ({ navigation }: any) => {
  const [phrase, setPhrase] = useState('');

  const validateAndImport = () => {
    try {
      // Validate the mnemonic phrase
      if (!ethers.utils.isValidMnemonic(phrase)) {
        Alert.alert('Error', 'Invalid recovery phrase. Please check and try again.');
        return;
      }

      // Here you would typically:
      // 1. Create wallet from mnemonic
      // 2. Save the wallet securely
      // 3. Set up authentication
      // 4. Navigate to home

      // For now, we'll just navigate to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (error) {
      console.error('Error importing wallet:', error);
      Alert.alert('Error', 'Failed to import wallet');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Import Wallet</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.subtitle}>
            Enter your secret recovery phrase
          </Text>
          
          <TextInput
            style={styles.phraseInput}
            multiline
            numberOfLines={4}
            value={phrase}
            onChangeText={setPhrase}
            placeholder="Enter your 12 or 24-word recovery phrase"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Text style={styles.hint}>
            Usually 12 or 24 words separated by spaces
          </Text>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Important:</Text>
          <Text style={styles.warningText}>
            • Never share your recovery phrase{'\n'}
            • Never enter it on any website{'\n'}
            • Keep it in a safe place
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.importButton,
            !phrase && styles.importButtonDisabled
          ]}
          onPress={validateAndImport}
          disabled={!phrase}
        >
          <Text style={styles.buttonText}>Import Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  inputContainer: {
    marginVertical: 20,
  },
  phraseInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hint: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  warningContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4D4D',
    marginBottom: 8,
  },
  warningText: {
    color: '#FF4D4D',
    lineHeight: 22,
  },
  importButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    paddingVertical: 16,
    marginTop: 'auto',
  },
  importButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
