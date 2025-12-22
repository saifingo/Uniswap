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
  ActivityIndicator,
} from 'react-native';
import { WalletService } from '../../services/walletService';

export const ImportWalletScreen = ({ navigation }: any) => {
  const [phrase, setPhrase] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const validateAndImport = async () => {
    // Prevent double-click
    if (isImporting) {
      console.log('Import already in progress, ignoring...');
      return;
    }

    console.log('=== Import Wallet Started ===');
    console.log('Phrase length:', phrase.length);
    console.log('Phrase word count:', phrase.trim().split(/\s+/).length);

    if (!phrase || phrase.trim() === '') {
      console.log('Error: Empty phrase');
      Alert.alert('Error', 'Please enter your recovery phrase');
      return;
    }

    setIsImporting(true);
    console.log('Import state set to true');

    try {
      console.log('Calling WalletService.importWallet...');
      
      // Import wallet using WalletService
      const wallet = await WalletService.importWallet(phrase.trim());
      
      console.log('Wallet imported successfully!');
      console.log('ETH Address:', wallet.ethereum.address);
      console.log('SOL Address:', wallet.solana.address);

      // Show success message and navigate
      Alert.alert(
        'Success! ✅',
        `Wallet imported successfully!\n\nETH: ${wallet.ethereum.address.substring(0, 10)}...\nSOL: ${wallet.solana.address.substring(0, 10)}...`
      );

      // Navigate to main app after short delay
      console.log('Navigating to MainApp...');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1500);
    } catch (error: any) {
      console.error('=== Import Error ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to import wallet. Please try again.';
      
      if (error?.message?.includes('Invalid')) {
        errorMessage = 'Invalid seed phrase. Please check your words and try again.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Import Failed ❌', errorMessage);
    } finally {
      console.log('Import process completed, resetting state');
      setIsImporting(false);
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
            (!phrase || isImporting) && styles.importButtonDisabled
          ]}
          onPress={validateAndImport}
          disabled={!phrase || isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Import Wallet</Text>
          )}
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
