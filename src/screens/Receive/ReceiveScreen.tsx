import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Clipboard, Share } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '../../components/common/Card';
import { StorageService } from '../../services/storage';

interface Chain {
  id: string;
  name: string;
  symbol: string;
  address: string;
  icon: string;
  color: string;
}

export const ReceiveScreen = () => {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletAddresses();
  }, []);

  const loadWalletAddresses = async () => {
    try {
      setLoading(true);
      const wallet = await StorageService.getActiveWallet();
      
      if (!wallet) {
        Alert.alert('Error', 'No active wallet found');
        return;
      }

      const availableChains: Chain[] = [
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          address: wallet.ethereumAddress,
          icon: 'ethereum',
          color: '#627EEA',
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          address: wallet.solanaAddress,
          icon: 'alpha-s-circle',
          color: '#14F195',
        },
      ];

      setChains(availableChains);
      setSelectedChain(availableChains[0]);
    } catch (error) {
      console.error('Error loading wallet addresses:', error);
      Alert.alert('Error', 'Failed to load wallet addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (selectedChain) {
      Clipboard.setString(selectedChain.address);
      Alert.alert('Copied! ✅', 'Address copied to clipboard');
    }
  };

  const handleShareAddress = async () => {
    if (selectedChain) {
      try {
        await Share.share({
          message: `My ${selectedChain.name} address:\n${selectedChain.address}`,
        });
      } catch (error) {
        console.error('Error sharing address:', error);
      }
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Receive</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receive</Text>
        <Text style={styles.headerSubtitle}>Scan QR code or copy address</Text>
      </View>

      {/* Chain Selector */}
      <View style={styles.chainSelector}>
        {chains.map((chain) => (
          <TouchableOpacity
            key={chain.id}
            style={[
              styles.chainButton,
              selectedChain?.id === chain.id && styles.chainButtonActive,
              { borderColor: selectedChain?.id === chain.id ? chain.color : '#E0E0E0' },
            ]}
            onPress={() => setSelectedChain(chain)}
          >
            <MaterialCommunityIcons
              name={chain.icon as any}
              size={24}
              color={selectedChain?.id === chain.id ? chain.color : '#666'}
            />
            <Text
              style={[
                styles.chainButtonText,
                selectedChain?.id === chain.id && { color: chain.color },
              ]}
            >
              {chain.symbol}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedChain && (
        <>
          {/* QR Code Card */}
          <Card style={styles.qrCard}>
            <View style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={selectedChain.address}
                  size={220}
                  backgroundColor="white"
                  color={selectedChain.color}
                />
              </View>
              <View style={styles.chainBadge}>
                <MaterialCommunityIcons
                  name={selectedChain.icon as any}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.chainBadgeText}>{selectedChain.name}</Text>
              </View>
            </View>
          </Card>

          {/* Address Card */}
          <Card style={styles.addressCard}>
            <Text style={styles.addressLabel}>Your {selectedChain.name} Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{selectedChain.address}</Text>
            </View>
            <Text style={styles.addressShort}>{shortenAddress(selectedChain.address)}</Text>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: selectedChain.color }]}
              onPress={handleCopyAddress}
            >
              <Ionicons name="copy-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Copy Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleShareAddress}
            >
              <Ionicons name="share-outline" size={20} color={selectedChain.color} />
              <Text style={[styles.actionButtonText, { color: selectedChain.color }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning Card */}
          <Card style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning-outline" size={20} color="#FF9800" />
              <Text style={styles.warningTitle}>Important</Text>
            </View>
            <Text style={styles.warningText}>
              • Only send {selectedChain.symbol} and {selectedChain.name}-based tokens to this address
            </Text>
            <Text style={styles.warningText}>
              • Sending other cryptocurrencies may result in permanent loss
            </Text>
            <Text style={styles.warningText}>
              • Always verify the address before sending
            </Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chainSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  chainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  chainButtonActive: {
    backgroundColor: '#F9F9F9',
  },
  chainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  qrCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    padding: 24,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF007A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  chainBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  addressContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  addressShort: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF007A',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  warningCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF9E6',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});
