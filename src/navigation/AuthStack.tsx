import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { CreateWalletScreen } from '../screens/Wallet/CreateWalletScreen';
import { ImportWalletScreen } from '../screens/Wallet/ImportWalletScreen';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen 
        name="CreateWallet" 
        component={CreateWalletScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <Stack.Screen 
        name="ImportWallet" 
        component={ImportWalletScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
    </Stack.Navigator>
  );
};
