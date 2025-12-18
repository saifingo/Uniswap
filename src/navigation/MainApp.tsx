import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SwapScreen } from '../screens/Swap/SwapScreen';
import { BuyScreen } from '../screens/Buy/BuyScreen';
import { SendScreen } from '../screens/Send/SendScreen';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';

type TabParamList = {
  Home: undefined;
  Swap: undefined;
  Send: undefined;
  Buy: undefined;
  Explore: undefined;
};

type StackParamList = {
  TabHome: undefined;
  Search: undefined;
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
        headerStyle: {
          backgroundColor: '#FF007A',
        },
        headerTintColor: '#fff',
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
        name="Buy" 
        component={BuyScreen}
        options={{
          tabBarIcon: ({ color, size }: IconProps) => (
            <MaterialCommunityIcons name="credit-card-plus" size={size} color={color} />
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
    </Stack.Navigator>
  );
};
