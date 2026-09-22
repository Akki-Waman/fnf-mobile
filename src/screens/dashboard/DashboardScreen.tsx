import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiClient } from '../../services/api';
import { profileApi } from '../../services/profileApi';
import { familyApi } from '../../services/familyApi';
import { intelligenceApi } from '../../services/intelligenceApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import { Avatar, Card, EmptyState } from '../../components';

export type Celebration = {
  id: string;
  name: string;
  subtitle: string;
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
  userName?: string;
  userPhotoUrl?: string | null;
  celebrations?: Celebration[];
  navigation?: { navigate: (route: string, params?: Record<string, unknown>) => void };
  onSeeAllPress?: () => void;
  onAddMemory?: () => void;
  onSendWish?: () => void;
  onNewEvent?: () => void;
  onFamilyTree?: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen({
  userName,
  userPhotoUrl,
  celebrations: celebrationsProp,
  navigation,
  onSeeAllPress,
  onAddMemory,
  onSendWish,
  onNewEvent,
  onFamilyTree,
}: DashboardScreenProps) {
  const greeting = getGreeting();
  const { signOut } = useAuth();
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();

  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [fetchedPhotoUrl, setFetchedPhotoUrl] = useState<string | null>(null);

  const [fetchedCelebrations, setFetchedCelebrations] = useState<Celebration[]>([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(celebrationsProp === undefined);
  const [celebrationsError, setCelebrationsError] = useState(false);

  // New Event Modal State
  const [newEventModalVisible, setNewEventModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'Birthday' | 'Anniversary' | 'Festival' | 'Special Event'>('Birthday');
  const [eventDate, setEventDate] = useState(new Date());
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const cachedPhoto = await AsyncStorage.getItem('@user_profile_photo');
      if (cachedPhoto) setFetchedPhotoUrl(cachedPhoto);

      const res = await profileApi.getMyProfile();
      if (res.success && res.data) {
        if (res.data.firstName) setFetchedName(res.data.firstName);
        if (res.data.profilePhotoUrl) {
          const resolved = familyApi.resolvePhotoUrl(res.data.profilePhotoUrl);
          if (resolved) {
            setFetchedPhotoUrl(resolved);
            await AsyncStorage.setItem('@user_profile_photo', resolved);
          }
        }
      }
    } catch (error) {
      console.log('Failed to load user profile', error);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );


  const displayName = userName || fetchedName;
  const displayPhotoUrl = userPhotoUrl || fetchedPhotoUrl;

  const loadCelebrations = useCallback(async () => {
    if (celebrationsProp !== undefined) return;
    setLoadingCelebrations(true);
    setCelebrationsError(false);
    try {
      let mapped: Celebration[] = [];
      const res = await intelligenceApi.getUpcomingCelebrations();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        mapped = res.data.map((item: any) => ({
          id: String(item.id || item.eventId || Math.random()),
          name: item.name || item.memberName || item.title || 'Celebration',
          subtitle: item.subtitle || item.eventDate || item.eventType || 'Upcoming Event',
          avatarUrl: item.avatarUrl || item.photoUrl || item.profilePhotoUrl || item.spousePhotoUrl || item.anniversaryPhotoUrl || null,
          avatarBg: item.avatarBg || '#F3E8FF',
          icon: item.icon || (item.eventType === 'ANNIVERSARY' ? 'heart' : 'gift'),
          iconBg: item.iconBg || (item.eventType === 'ANNIVERSARY' ? '#FEE2E2' : '#FFF1F2'),
          iconColor: item.iconColor || (item.eventType === 'ANNIVERSARY' ? '#EF4444' : '#FF5F6D'),
        }));
      }

      // Check locally created custom events
      const customEventsRaw = await AsyncStorage.getItem('@custom_user_events');
      if (customEventsRaw) {
        const customList: Celebration[] = JSON.parse(customEventsRaw);
        mapped = [...customList, ...mapped];
      }

      // Check locally saved Spouse & Anniversary info
      const spouseRaw = await AsyncStorage.getItem('@user_spouse_info');
      if (spouseRaw) {
        const spouseData = JSON.parse(spouseRaw);
        if (spouseData.spouseName && spouseData.spouseDob) {
          const spouseDobDate = new Date(spouseData.spouseDob);
          const dobFormatted = spouseDobDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const spouseBdayEvent: Celebration = {
            id: 'spouse_bday_event',
            name: `${spouseData.spouseName}'s Birthday`,
            subtitle: `Birthday • ${dobFormatted}`,
            avatarUrl: spouseData.spousePhotoUrl || null,
            avatarBg: '#FFF0F2',
            icon: 'gift',
            iconBg: '#FFF1F2',
            iconColor: '#FF5F6D',
          };
          if (!mapped.some(c => c.name.includes(spouseData.spouseName))) {
            mapped.unshift(spouseBdayEvent);
          }
        }

        if (spouseData.anniversaryDate) {
          const annivDate = new Date(spouseData.anniversaryDate);
          const annivFormatted = annivDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const anniversaryEvent: Celebration = {
            id: 'anniversary_event',
            name: 'Wedding Anniversary',
            subtitle: `Anniversary • ${annivFormatted}`,
            avatarUrl: spouseData.anniversaryPhotoUrl || spouseData.spousePhotoUrl || null,
            avatarBg: '#FCE7F3',
            icon: 'heart',
            iconBg: '#FEE2E2',
            iconColor: '#EF4444',
          };
          if (!mapped.some(c => c.name.toLowerCase().includes('anniversary'))) {
            mapped.push(anniversaryEvent);
          }
        }
      }

      setFetchedCelebrations(mapped);
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

  const handleAddMemory = () => {
    if (onAddMemory) {
      onAddMemory();
      return;
    }
    navigation?.navigate('Memories');
  };

  const handleSendWish = () => {
    if (onSendWish) {
      onSendWish();
      return;
    }
    navigation?.navigate('MessageScheduler');
  };

  const handleOpenNewEvent = () => {
    if (onNewEvent) {
      onNewEvent();
      return;
    }
    setNewEventModalVisible(true);
  };

  const handleSeeAll = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
      return;
    }
    navigation?.navigate('EventDetails');
  };

  const handleSaveNewEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter an event title.');
      return;
    }

    try {
      setSavingEvent(true);
      const dateFormatted = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const newCeleb: Celebration = {
        id: `custom_event_${Date.now()}`,
        name: eventTitle.trim(),
        subtitle: `${eventType} • ${dateFormatted}`,
        avatarBg: '#EEF2FF',
        icon: eventType === 'Birthday' ? 'gift' : eventType === 'Anniversary' ? 'heart' : 'sparkles',
        iconBg: eventType === 'Birthday' ? '#FFF1F2' : eventType === 'Anniversary' ? '#FEE2E2' : '#EEF2FF',
        iconColor: eventType === 'Birthday' ? '#FF5F6D' : eventType === 'Anniversary' ? '#EF4444' : '#6366F1',
      };

      // Save locally to @custom_user_events
      const existingRaw = await AsyncStorage.getItem('@custom_user_events');
      const existingEvents: Celebration[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingEvents.unshift(newCeleb);
      await AsyncStorage.setItem('@custom_user_events', JSON.stringify(existingEvents));

      setFetchedCelebrations((prev) => [newCeleb, ...prev]);
      Alert.alert('Event Created! 🎉', `${eventTitle} has been added to your upcoming events.`);
      setNewEventModalVisible(false);
      setEventTitle('');
    } catch (error) {
      console.log('Failed to save new event', error);
      Alert.alert('Error', 'Could not create event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const quickActions: QuickAction[] = [
    { id: '1', label: 'Add Memory', icon: 'images-outline', color: '#7C3AED', bg: '#F3E8FF', onPress: handleAddMemory },
    { id: '2', label: 'Send Wish', icon: 'gift-outline', color: '#FF5F6D', bg: '#FFF1F2', onPress: handleSendWish },
    { id: '3', label: 'New Event', icon: 'calendar-outline', color: '#3B82F6', bg: '#EFF6FF', onPress: handleOpenNewEvent },
    { id: '4', label: 'Family Tree', icon: 'people-outline', color: '#10B981', bg: '#ECFDF5', onPress: handleFamilyTree },
  ];

  const formatDateDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <LinearGradient colors={colors.gradientPrimary} style={styles.headerGradient}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerContent}>
            <View style={styles.topRow}>
              <View style={styles.greetingContainer}>
                <Avatar
                  name={displayName || 'User'}
                  source={displayPhotoUrl}
                  size="md"
                  style={styles.avatarShadow}
                />
                <View style={styles.nameTextContainer}>
                  <Text style={styles.greetingTitle}>
                    {displayName ? `${greeting}, ${displayName}! 👋` : `${greeting}! 👋`}
                  </Text>
                  <Text style={styles.greetingSubtitle}>Welcome back to your family hub</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={signOut}
                style={[styles.iconButton, shadows.sm]}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Body Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontWeight: typography.fontWeight.bold }]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.8}
              style={[styles.quickCard, { backgroundColor: colors.surface }, shadows.sm]}
              onPress={action.onPress}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Celebrations Section */}
        <Card variant="elevated" style={styles.celebrationsCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleIconRow}>
              <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary, fontWeight: typography.fontWeight.bold }]}>
                Upcoming Celebrations
              </Text>
            </View>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={[styles.seeAllText, { color: colors.primary, fontWeight: typography.fontWeight.semibold }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loadingCelebrations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : celebrationsError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load celebrations"
              actionTitle="Tap to retry"
              onAction={loadCelebrations}
            />
          ) : celebrations.length === 0 ? (
            <EmptyState
              icon="balloon-outline"
              title="No upcoming celebrations"
              description="Birthdays and anniversaries will appear here automatically."
            />
          ) : (
            celebrations.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.celebrationRow,
                  { borderBottomColor: colors.divider },
                  index === celebrations.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                ]}
              >
                <Avatar name={item.name} source={item.avatarUrl} size="md" />

                <View style={styles.celebrationTextContainer}>
                  <Text style={[styles.celebrationName, { color: colors.textPrimary, fontWeight: typography.fontWeight.bold }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>

                <View style={[styles.badgeCircle, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={18} color={item.iconColor} />
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* New Event Modal */}
      <Modal visible={newEventModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={() => setNewEventModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Event Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Papa's 50th Birthday, Graduation"
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Event Type</Text>
              <View style={styles.chipRow}>
                {(['Birthday', 'Anniversary', 'Festival', 'Special Event'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, eventType === type && styles.typeChipActive]}
                    onPress={() => setEventType(type)}
                  >
                    <Text style={[styles.typeChipText, eventType === type && styles.typeChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Event Date</Text>
              <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowEventDatePicker(true)}>
                <Text style={styles.datePickerText}>{formatDateDisplay(eventDate)}</Text>
                <Ionicons name="calendar-outline" size={22} color="#3B82F6" />
              </TouchableOpacity>

              {showEventDatePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowEventDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setEventDate(selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveNewEvent}
                disabled={savingEvent}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.saveGradient}>
                  {savingEvent ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Event</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarShadow: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  nameTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  celebrationsCard: {
    padding: 18,
    borderRadius: 22,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
  },
  seeAllText: {
    fontSize: 14,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  celebrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  celebrationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  celebrationName: {
    fontSize: 15,
  },
  celebrationSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  typeChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeChipTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  datePickerBox: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  saveBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  saveGradient: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});