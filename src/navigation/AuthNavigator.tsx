import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTP: { phoneNumber: string };
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}