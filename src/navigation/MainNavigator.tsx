import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CreateFamilyTreeScreen from '../screens/family/CreateFamilyTreeScreen';

export type MainStackParamList = {
  Dashboard: undefined;
  FamilyTree: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="FamilyTree" component={CreateFamilyTreeScreen} />
    </Stack.Navigator>
  );
}