import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService, WalletInfo } from '../../services/storage';

export const WalletManagementScreen = ({ navigation }: any) => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    const allWallets = await StorageService.getAllWallets();
    const activeId = await StorageService.getActiveWalletId();
    setWallets(allWallets);
    setActiveWalletId(activeId);
  };

  const handleSwitchWallet = async (walletId: string) => {
    await StorageService.setActiveWallet(walletId);
    setActiveWalletId(walletId);
    Alert.alert('Success', 'Wallet switched successfully!');
    navigation.goBack();
  };

  const handleDeleteWallet = (wallet: WalletInfo) => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${wallet.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteWallet(wallet.id);
            await loadWallets();
            Alert.alert('Success', 'Wallet deleted successfully!');
          },
        },
      ]
    );
  };

  const handleRenameWallet = (wallet: WalletInfo) => {
    setEditingWallet(wallet.id);
    setNewName(wallet.name);
    setShowRenameModal(true);
  };

  const saveWalletName = async () => {
    if (editingWallet && newName.trim()) {
      await StorageService.updateWalletName(editingWallet, newName.trim());
      await loadWallets();
      setShowRenameModal(false);
      setEditingWallet(null);
      setNewName('');
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (address: string) => {
    const colors = ['#FF007A', '#7B61FF', '#00C853', '#FF6B00', '#00B8D4'];
    const index = parseInt(address.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallets</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ImportWallet')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#FF007A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wallet-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>No wallets found</Text>
            <Text style={styles.emptySubtext}>Import or create a wallet to get started</Text>
            <TouchableOpacity
              style={styles.importButton}
              onPress={() => navigation.navigate('ImportWallet')}
            >
              <Text style={styles.importButtonText}>Import Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wallets.map((wallet) => {
            const isActive = wallet.id === activeWalletId;
            const iconColor = getWalletIcon(wallet.ethereumAddress);

            return (
              <TouchableOpacity
                key={wallet.id}
                style={[styles.walletCard, isActive && styles.activeWalletCard]}
                onPress={() => !isActive && handleSwitchWallet(wallet.id)}
              >
                <View style={styles.walletHeader}>
                  <View style={styles.walletIconContainer}>
                    <LinearGradient
                      colors={[iconColor, iconColor + '80']}
                      style={styles.walletIcon}
                    >
                      <MaterialCommunityIcons name="wallet" size={24} color="#FFF" />
                    </LinearGradient>
                  </View>

                  <View style={styles.walletInfo}>
                    <View style={styles.walletNameRow}>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.walletType}>
                      {wallet.isImported ? 'Imported' : 'Created'} •{' '}
                      {new Date(wallet.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                      Alert.alert('Wallet Options', `Choose an action for "${wallet.name}"`, [
                        {
                          text: 'Rename',
                          onPress: () => handleRenameWallet(wallet),
                        },
                        {
                          text: 'Delete',
                          onPress: () => handleDeleteWallet(wallet),
                          style: 'destructive',
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.addressesContainer}>
                  <View style={styles.addressRow}>
                    <View style={styles.addressLabel}>
                      <MaterialCommunityIcons name="ethereum" size={16} color="#627EEA" />
                      <Text style={styles.addressLabelText}>ETH</Text>
                    </View>
                    <Text style={styles.addressText}>
                      {shortenAddress(wallet.ethereumAddress)}
                    </Text>
                  </View>

                  <View style={styles.addressRow}>
                    <View style={styles.addressLabel}>
                      <MaterialCommunityIcons name="alpha-s-circle" size={16} color="#14F195" />
                      <Text style={styles.addressLabelText}>SOL</Text>
                    </View>
                    <Text style={styles.addressText}>
                      {shortenAddress(wallet.solanaAddress)}
                    </Text>
                  </View>
                </View>

                {!isActive && (
                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => handleSwitchWallet(wallet.id)}
                  >
                    <Text style={styles.switchButtonText}>Switch to this wallet</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal visible={showRenameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Wallet</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter wallet name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowRenameModal(false);
                  setEditingWallet(null);
                  setNewName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveWalletName}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  importButton: {
    backgroundColor: '#FF007A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  importButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  walletCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeWalletCard: {
    borderColor: '#FF007A',
    backgroundColor: '#FFF5F9',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconContainer: {
    marginRight: 12,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: '#FF007A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  walletType: {
    fontSize: 12,
    color: '#999',
  },
  menuButton: {
    padding: 8,
  },
  addressesContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
  },
  switchButton: {
    backgroundColor: '#FF007A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  modalSaveButton: {
    backgroundColor: '#FF007A',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
