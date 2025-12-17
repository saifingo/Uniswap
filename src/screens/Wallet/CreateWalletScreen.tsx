import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ethers } from 'ethers';

export const CreateWalletScreen = ({ navigation }: any) => {
  const [mnemonic, setMnemonic] = useState('');

  const generateWallet = async () => {
    try {
      // Generate a random mnemonic (24 words)
      const wallet = ethers.Wallet.createRandom();
      setMnemonic(wallet.mnemonic.phrase);
    } catch (error) {
      console.error('Error generating wallet:', error);
      Alert.alert('Error', 'Failed to generate wallet');
    }
  };

  const handleContinue = () => {
    if (!mnemonic) {
      Alert.alert('Error', 'Please generate a wallet first');
      return;
    }

    // Here you would typically:
    // 1. Save the wallet securely
    // 2. Set up authentication
    // 3. Navigate to home
    
    // For now, we'll just navigate to home
    // In a real app, you'd want to persist this state
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create New Wallet</Text>
        
        <View style={styles.mnemonicContainer}>
          {mnemonic ? (
            <>
              <Text style={styles.subtitle}>Your Secret Recovery Phrase:</Text>
              <View style={styles.phraseContainer}>
                {mnemonic.split(' ').map((word, index) => (
                  <View key={index} style={styles.wordContainer}>
                    <Text style={styles.wordNumber}>{index + 1}.</Text>
                    <Text style={styles.word}>{word}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.warning}>
                ⚠️ Write down these words in the correct order and store them safely.
                Never share them with anyone!
              </Text>
            </>
          ) : (
            <Text style={styles.subtitle}>
              Generate a new wallet to get your secret recovery phrase
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!mnemonic ? (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateWallet}
            >
              <Text style={styles.buttonText}>Generate Wallet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>I've Saved My Phrase</Text>
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  mnemonicContainer: {
    flex: 1,
    marginVertical: 20,
  },
  phraseContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordContainer: {
    flexDirection: 'row',
    width: '33%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  wordNumber: {
    color: '#666',
    marginRight: 4,
    width: 24,
  },
  word: {
    fontWeight: '600',
  },
  warning: {
    color: '#FF4D4D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  generateButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    paddingVertical: 16,
  },
  continueButton: {
    backgroundColor: '#00C853',
    borderRadius: 25,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
