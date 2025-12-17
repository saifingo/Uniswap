import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SwapScreen } from '../screens/Swap/SwapScreen';
import { BuyScreen } from '../screens/Buy/BuyScreen';
import { SendScreen } from '../screens/Send/SendScreen';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';

const Tab = createBottomTabNavigator();

export const MainApp = () => {
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Swap" 
        component={SwapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Send" 
        component={SendScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Buy" 
        component={BuyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-plus" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
