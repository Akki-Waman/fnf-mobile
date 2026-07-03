import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../services/api';

// ---- Types ----
export type Celebration = {
  id: string;
  name: string;
  subtitle: string; // e.g. 'Today', 'Tomorrow', 'In 3 days'
  avatarUrl?: string | null;
  avatarBg?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

type QuickAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress?: () => void;
};

type DashboardScreenProps = {
  userName?: string; // optional override - if not passed, the screen fetches it itself
  celebrations?: Celebration[]; // optional override - if not passed, the screen fetches it itself
  navigation?: { navigate: (route: string, params?: Record<string, unknown>) => void };
  onSeeAllPress?: () => void;
  onAddMemory?: () => void;
  onSendWish?: () => void;
  onNewEvent?: () => void;
  onFamilyTree?: () => void;
};

// ---- Time-based greeting ----
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen({
  userName,
  celebrations: celebrationsProp,
  navigation,
  onSeeAllPress,
  onAddMemory,
  onSendWish,
  onNewEvent,
  onFamilyTree,
}: DashboardScreenProps) {
  const greeting = getGreeting();
  const [fetchedName, setFetchedName] = useState<string | null>(null);

  const [fetchedCelebrations, setFetchedCelebrations] = useState<Celebration[]>([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(celebrationsProp === undefined);
  const [celebrationsError, setCelebrationsError] = useState(false);

  // ---- Profile name ----
  useEffect(() => {
    if (userName) return;

    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const res = await apiClient.get('/user/profile/me');
        if (res.data?.success) {
          const data = res.data?.data;
          if (data?.firstName) {
            setFetchedName(data.firstName);
          }
        }
      } catch (error) {
        console.log('Failed to load user profile', error);
      }
    };

    loadUser();
  }, [userName]);

  const displayName = userName || fetchedName;

  // ---- Upcoming celebrations ----
  const loadCelebrations = useCallback(async () => {
    if (celebrationsProp !== undefined) return; // caller controls the data, don't fetch

    setLoadingCelebrations(true);
    setCelebrationsError(false);
    try {
      const res = await apiClient.get('/family/celebrations/upcoming');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setFetchedCelebrations(res.data.data);
      } else {
        setFetchedCelebrations([]);
      }
    } catch (error) {
      console.log('Failed to load upcoming celebrations', error);
      setCelebrationsError(true);
    } finally {
      setLoadingCelebrations(false);
    }
  }, [celebrationsProp]);

  useEffect(() => {
    loadCelebrations();
  }, [loadCelebrations]);

  const celebrations = celebrationsProp ?? fetchedCelebrations;

  const handleFamilyTree = () => {
    if (onFamilyTree) {
      onFamilyTree();
      return;
    }
    navigation?.navigate('FamilyTree');
  };

  const quickActions: QuickAction[] = [
    { id: '1', label: 'Add\nMemory', icon: 'images-outline', color: '#7C3AED', bg: '#EDE9FE', onPress: onAddMemory },
    { id: '2', label: 'Send\nWish', icon: 'gift-outline', color: '#F97316', bg: '#FFEDD5', onPress: onSendWish },
    { id: '3', label: 'New\nEvent', icon: 'calendar-outline', color: '#EF4444', bg: '#FEE2E2', onPress: onNewEvent },
    { id: '4', label: 'Family\nTree', icon: 'people-outline', color: '#EC4899', bg: '#FCE7F3', onPress: handleFamilyTree },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Gradient */}
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <Text style={styles.greetingText}>
              {displayName ? `${greeting}, ${displayName}! 👋` : `${greeting}! 👋`}
            </Text>
            <Text style={styles.subtitleText}>
              Here's what's happening today in your family.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming Celebrations Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Upcoming Celebrations</Text>
            <TouchableOpacity onPress={onSeeAllPress}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingCelebrations ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#8B5CF6" />
            </View>
          ) : celebrationsError ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={28} color="#C4B5FD" />
              <Text style={styles.emptyStateText}>Couldn't load celebrations</Text>
              <TouchableOpacity onPress={loadCelebrations}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : celebrations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={28} color="#C4B5FD" />
              <Text style={styles.emptyStateText}>No upcoming celebrations yet</Text>
            </View>
          ) : (
            celebrations.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.celebrationRow,
                  index === celebrations.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={[styles.avatarCircle, { backgroundColor: item.avatarBg || '#8B5CF6' }]}>
                  <Ionicons name="person" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.celebrationTextContainer}>
                  <Text style={styles.celebrationName}>{item.name}</Text>
                  <Text style={styles.celebrationSubtitle}>{item.subtitle}</Text>
                </View>

                <View style={[styles.badgeCircle, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={16} color={item.iconColor} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Quick Actions - pinned to bottom */}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.quickActionsWrapper}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionBox} onPress={action.onPress}>
              <View style={[styles.actionIconCircle, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerGradient: {
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitleText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 6,
    lineHeight: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -5,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  celebrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF8FF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  celebrationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  celebrationSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badgeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  retryText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 8,
  },
  quickActionsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  actionBox: {
    backgroundColor: '#FFFFFF',
    width: '23%',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },
});