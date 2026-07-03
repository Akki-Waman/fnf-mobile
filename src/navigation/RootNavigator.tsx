import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

function RootSwitch() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <RootSwitch />
    </AuthProvider>
  );
}