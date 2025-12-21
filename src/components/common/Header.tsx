import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  address: string;
  onSearchPress: () => void;
  walletName?: string;
}

export const Header = ({ address, onSearchPress, walletName }: HeaderProps) => {
  const navigation = useNavigation();
  const [searchScale] = React.useState(() => new Animated.Value(1));
  
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleAvatarPress = () => {
    navigation.navigate('WalletManagement' as never);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
        <LinearGradient
          colors={['#FF007A', '#FF6B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Image
            source={{ uri: `https://avatars.dicebear.com/api/jdenticon/${address}.svg` }}
            style={styles.avatar}
          />
        </LinearGradient>
        <View style={styles.addressInfo}>
          {walletName && <Text style={styles.walletName}>{walletName}</Text>}
          <Text style={styles.address}>{shortenAddress(address)}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.searchButton, {
          transform: [{ scale: searchScale }]
        }]}
        onPressIn={() => {
          Animated.spring(searchScale, {
            toValue: 0.9,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(searchScale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={24} color="#FF007A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5F0',
    padding: 8,
    borderRadius: 25,
  },
  gradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: '#FFF',
  },
  addressInfo: {
    marginHorizontal: 8,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  address: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFE5F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
