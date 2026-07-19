import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CreateFamilyTreeScreen from '../screens/family/CreateFamilyTreeScreen';
import ContactDiscoveryScreen from '../screens/connections/ContactDiscoveryScreen';
import FriendRequestsScreen from '../screens/connections/FriendRequestsScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import PersonalChatScreen from '../screens/chat/PersonalChatScreen';
import MessageSchedulerScreen from '../screens/chat/MessageSchedulerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RelationshipIntelligenceScreen from '../screens/profile/RelationshipIntelligenceScreen';
import PrivacySharingScreen from '../screens/settings/PrivacySharingScreen';
import MemoriesScreen from '../screens/memories/MemoriesScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

export type MainTabParamList = {
  Home: undefined;
  Network: undefined;
  Add: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  FamilyTree: undefined;
  FriendRequests: undefined;
  PersonalChat: undefined;
  MessageScheduler: undefined;
  RelationshipIntelligence: undefined;
  PrivacySharing: undefined;
  Memories: undefined;
  EventDetails: undefined;
  Notifications: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Network') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF8A65', // App theme orange/coral
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Network" component={ContactDiscoveryScreen} />
      <Tab.Screen name="Add" component={CreateFamilyTreeScreen} />
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="FamilyTree" component={CreateFamilyTreeScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="PersonalChat" component={PersonalChatScreen} />
      <Stack.Screen name="MessageScheduler" component={MessageSchedulerScreen} />
      <Stack.Screen name="RelationshipIntelligence" component={RelationshipIntelligenceScreen} />
      <Stack.Screen name="PrivacySharing" component={PrivacySharingScreen} />
      <Stack.Screen name="Memories" component={MemoriesScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}