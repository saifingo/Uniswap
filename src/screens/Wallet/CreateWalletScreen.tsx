import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WalletService } from '../../services/walletService';

export const CreateWalletScreen = ({ navigation }: any) => {
  const [mnemonic, setMnemonic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateWallet = async () => {
    setIsGenerating(true);
    try {
      // Create wallet using WalletService
      const wallet = await WalletService.createWallet();
      
      // Display the mnemonic to user
      setMnemonic(wallet.mnemonic);
    } catch (error) {
      console.error('Error generating wallet:', error);
      Alert.alert(
        'Error',
        'Failed to generate wallet. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (mnemonic) {
      Clipboard.setString(mnemonic);
      Alert.alert('Copied! ✅', 'Recovery phrase copied to clipboard');
    }
  };

  const handleContinue = () => {
    // Prevent double-click
    if (isSaving) {
      console.log('Already saving, ignoring...');
      return;
    }

    if (!mnemonic) {
      Alert.alert('Error', 'Please generate a wallet first');
      return;
    }

    setIsSaving(true);

    // Show confirmation and navigate
    Alert.alert(
      'Important! ⚠️',
      'Make sure you have saved your 12-word recovery phrase. You will need it to recover your wallet.\n\nNavigating to home screen...'
    );

    // Navigate to main app after short delay
    console.log('Navigating to MainApp from CreateWallet...');
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }, 2000);
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
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyToClipboard}
              >
                <Ionicons name="copy-outline" size={20} color="#FF007A" />
                <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
              </TouchableOpacity>
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
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={generateWallet}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Generate Wallet</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.continueButton, isSaving && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>I've Saved My Phrase</Text>
              )}
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
    minHeight: 56,
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#FFB0D1',
  },
  continueButton: {
    backgroundColor: '#00C853',
    borderRadius: 25,
    paddingVertical: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#80E4A0',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF007A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#FF007A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
