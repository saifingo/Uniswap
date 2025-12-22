import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SwapScreen } from '../screens/Swap/SwapScreen';
import { ReceiveScreen } from '../screens/Receive/ReceiveScreen';
import { SendScreen } from '../screens/Send/SendScreen';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { TokenDetailsScreen } from '../screens/Token/TokenDetailsScreen';
import { WalletManagementScreen } from '../screens/Wallet/WalletManagementScreen';
import { ImportWalletScreen } from '../screens/Wallet/ImportWalletScreen';
import { CreateWalletScreen } from '../screens/Wallet/CreateWalletScreen';

type TabParamList = {
  Home: undefined;
  Swap: undefined;
  Send: undefined;
  Receive: undefined;
  Explore: undefined;
};

type StackParamList = {
  TabHome: undefined;
  Search: undefined;
  Token: { token: any };
  Receive: { token?: any };
  WalletManagement: undefined;
  ImportWallet: undefined;
  CreateWallet: undefined;
};

type IconProps = {
  color: string;
  size: number;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF007A',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }: IconProps) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Swap" 
        component={SwapScreen}
        options={{
          tabBarIcon: ({ color, size }: IconProps) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Send" 
        component={SendScreen}
        options={{
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="send" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Receive" 
        component={ReceiveScreen}
        options={{
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="download-outline" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }: IconProps) => (
            <Ionicons name="compass" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export const MainApp: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabHome" component={TabNavigator} />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Token"
        component={TokenDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="WalletManagement"
        component={WalletManagementScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ImportWallet"
        component={ImportWalletScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="CreateWallet"
        component={CreateWalletScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};
