import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

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
  const { colors, shadows, borderRadius } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Network') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          if (route.name === 'Add') {
            return (
              <View
                style={[
                  styles.addIconContainer,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.full,
                    ...shadows.primaryGlow,
                  },
                ]}
              >
                <Ionicons name="add" size={26} color={colors.white} />
              </View>
            );
          }

          return (
            <View style={focused ? [styles.activeTabPill, { backgroundColor: colors.surfaceHighlighted }] : null}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Network" component={ContactDiscoveryScreen} options={{ tabBarLabel: 'Network' }} />
      <Tab.Screen name="Add" component={CreateFamilyTreeScreen} options={{ tabBarLabel: 'Family' }} />
      <Tab.Screen name="Chats" component={ChatListScreen} options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
});

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