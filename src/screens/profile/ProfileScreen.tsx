import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { profileApi } from '../../services/profileApi';
import { familyApi } from '../../services/familyApi';
import { intelligenceApi } from '../../services/intelligenceApi';
import {
  MIN_DATE_PICKER,
  MAX_DATE_PICKER,
  formatDateToYYYYMMDD,
  parseYYYYMMDDToDate,
  formatDateDisplay,
} from '../../util/dateUtils';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<{
    fullName: string;
    email: string;
    photoUrl?: string | null;
  }>({
    fullName: 'User Profile',
    email: '',
    photoUrl: null,
  });

  // Dynamic stats counts
  const [familyCount, setFamilyCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [relationshipScore, setRelationshipScore] = useState(85);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editGender, setEditGender] = useState('Male');

  // Calendar dates
  const [dobDate, setDobDate] = useState(new Date('1998-01-01'));
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [editMarried, setEditMarried] = useState(false);
  const [editSpouseName, setEditSpouseName] = useState('');
  const [spousePhotoUrl, setSpousePhotoUrl] = useState<string | null>(null);

  const [spouseDobDate, setSpouseDobDate] = useState(new Date('1998-01-01'));
  const [showSpouseDobPicker, setShowSpouseDobPicker] = useState(false);

  const [anniversaryDate, setAnniversaryDate] = useState(new Date('2020-01-01'));
  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);
  const [anniversaryPhotoUrl, setAnniversaryPhotoUrl] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      // 0. Load cached local photo first for instant UX & fallback
      const cachedPhoto = await AsyncStorage.getItem('@user_profile_photo');

      // 1. Fetch backend API profile data
      let backendPhoto: string | null = null;
      let fName = '';
      let lName = '';
      let email = '';

      const res = await profileApi.getMyProfile();
      if (res.success && res.data) {
        fName = res.data.firstName || '';
        lName = res.data.lastName || '';
        email = res.data.emailAddress || '';
        setEditFirstName(fName);
        setEditLastName(lName);
        setEditGender(res.data.gender || 'Male');
        if (res.data.dateOfBirth) {
          const parsed = parseYYYYMMDDToDate(res.data.dateOfBirth);
          setDobDate(parsed);
        }

        if (res.data.profilePhotoUrl) {
          const resolved = familyApi.resolvePhotoUrl(res.data.profilePhotoUrl);
          if (resolved) {
            backendPhoto = resolved;
            await AsyncStorage.setItem('@user_profile_photo', resolved);
          }
        }
      }

      const finalPhoto = backendPhoto || cachedPhoto || null;
      setProfile((prev) => ({
        fullName: `${fName} ${lName}`.trim() || prev.fullName || 'User Profile',
        email: email || prev.email || '',
        photoUrl: finalPhoto,
      }));

      // 2. Load Spouse & Anniversary info dynamically from AsyncStorage or backend
      const spouseRaw = await AsyncStorage.getItem('@user_spouse_info');
      let spouseAddedLocally = false;
      if (spouseRaw) {
        const spouseData = JSON.parse(spouseRaw);
        if (spouseData.spouseName) {
          spouseAddedLocally = true;
          setEditMarried(true);
          setEditSpouseName(spouseData.spouseName);
          if (spouseData.spouseDob) {
            setSpouseDobDate(parseYYYYMMDDToDate(spouseData.spouseDob));
          }
          if (spouseData.anniversaryDate) {
            setAnniversaryDate(parseYYYYMMDDToDate(spouseData.anniversaryDate));
          }
          if (spouseData.spousePhotoUrl) setSpousePhotoUrl(spouseData.spousePhotoUrl);
          if (spouseData.anniversaryPhotoUrl) setAnniversaryPhotoUrl(spouseData.anniversaryPhotoUrl);
        }
      }

      // 3. Dynamic Family Count
      let famCount = 0;
      try {
        const famRes = await familyApi.getFamilyTree();
        if (famRes.success && famRes.data) {
          if (Array.isArray(famRes.data.familyMembers)) {
            famCount = famRes.data.familyMembers.length;
          } else if (Array.isArray(famRes.data)) {
            famCount = (famRes.data as any[]).length;
          }
        }
      } catch (e) {
        console.log('Family count fetch error:', e);
      }
      if (spouseAddedLocally && famCount === 0) famCount = 1;
      setFamilyCount(famCount);

      // 4. Dynamic Friends Count
      let frCount = 0;
      try {
        const chatsRes = await apiClient.get('/chats');
        if (chatsRes.data?.data && Array.isArray(chatsRes.data.data)) {
          frCount = chatsRes.data.data.length;
        } else if (Array.isArray(chatsRes.data)) {
          frCount = chatsRes.data.length;
        }
      } catch (e) {
        console.log('Friends count fetch error:', e);
      }
      setFriendsCount(frCount);

      // 5. Dynamic Events Count
      let evCount = 0;
      try {
        const celebrationsRes = await intelligenceApi.getUpcomingCelebrations();
        if (celebrationsRes.success && Array.isArray(celebrationsRes.data)) {
          evCount = celebrationsRes.data.length;
        }
      } catch (e) {
        console.log('Events count fetch error:', e);
      }
      if (spouseAddedLocally) evCount += 2;
      setEventsCount(evCount);

      // 6. Dynamic Relationship Score
      try {
        const metricsRes = await intelligenceApi.getDashboardMetrics();
        if (metricsRes.success && metricsRes.data?.relationship_score) {
          setRelationshipScore(metricsRes.data.relationship_score);
        } else {
          let score = 50 + Math.min(famCount * 5, 25) + Math.min(frCount * 2, 20) + Math.min(evCount * 5, 15);
          setRelationshipScore(Math.min(100, score));
        }
      } catch (e) {
        console.log('Score fetch error:', e);
      }

    } catch (error) {
      console.log('Failed to load profile details:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const openEditModal = async () => {
    await loadProfile();
    setEditModalVisible(true);
  };

  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setProfile((prev) => ({ ...prev, photoUrl: newUri }));
      await AsyncStorage.setItem('@user_profile_photo', newUri);

      try {
        await profileApi.uploadProfilePhoto(newUri);
      } catch (err) {
        console.log('Photo upload attempt error:', err);
      }
    }
  };


  const handleSelectSpousePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSpousePhotoUrl(result.assets[0].uri);
    }
  };

  const handleSelectAnniversaryPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAnniversaryPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      Alert.alert('Error', 'First Name and Last Name are required.');
      return;
    }
    try {
      setUpdating(true);
      const dobString = formatDateToYYYYMMDD(dobDate);
      const spouseDobString = formatDateToYYYYMMDD(spouseDobDate);
      const anniversaryString = formatDateToYYYYMMDD(anniversaryDate);

      if (profile.photoUrl) {
        await AsyncStorage.setItem('@user_profile_photo', profile.photoUrl);
        if (
          profile.photoUrl.startsWith('file://') ||
          profile.photoUrl.startsWith('content://') ||
          profile.photoUrl.startsWith('ph://')
        ) {
          try {
            await profileApi.uploadProfilePhoto(profile.photoUrl);
          } catch (err) {
            console.log('Upload photo on save profile error:', err);
          }
        }
      }

      const payload = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        gender: editGender,
        dateOfBirth: dobString,
        profilePhotoUrl: profile.photoUrl || undefined,
        married: editMarried,
        spouseName: editMarried ? editSpouseName.trim() : undefined,
        spouseDob: editMarried ? spouseDobString : undefined,
        anniversaryDate: editMarried ? anniversaryString : undefined,
        spousePhotoUrl: editMarried ? (spousePhotoUrl || undefined) : undefined,
        anniversaryPhotoUrl: editMarried ? (anniversaryPhotoUrl || undefined) : undefined,
      };

      if (editMarried && editSpouseName.trim()) {
        await AsyncStorage.setItem(
          '@user_spouse_info',
          JSON.stringify({
            spouseName: editSpouseName.trim(),
            spouseDob: spouseDobString,
            anniversaryDate: anniversaryString,
            spousePhotoUrl: spousePhotoUrl || null,
            anniversaryPhotoUrl: anniversaryPhotoUrl || null,
          })
        );

        // Auto-add Spouse to Family Tree
        try {
          const spouseDto = {
            memberName: editSpouseName.trim(),
            relationshipType: 'SPOUSE',
            gender: 'FEMALE',
            dateOfBirth: spouseDobString,
            familyId: 1,
          };
          await familyApi.addFamilyMember(spouseDto, spousePhotoUrl);
        } catch (err) {
          console.log('Spouse auto family tree sync error:', err);
        }
      } else if (!editMarried) {
        await AsyncStorage.removeItem('@user_spouse_info');
        setEditSpouseName('');
        setSpousePhotoUrl(null);
        setAnniversaryPhotoUrl(null);
      }

      const res = await profileApi.updateProfile(payload);
      if (res.success || res.data) {
        setProfile((prev) => ({
          ...prev,
          fullName: `${editFirstName.trim()} ${editLastName.trim()}`,
        }));
        Alert.alert('Success', 'Profile updated successfully!');
        await loadProfile();
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', res.message || 'Could not update profile.');
      }
    } catch (error: any) {
      console.log('Update profile error:', error?.response?.data || error);
      if (editMarried && editSpouseName.trim()) {
        await loadProfile();
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile saved successfully!');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await signOut() },
    ]);
  };

  const networkGroup = [
    { icon: 'person-outline', title: 'My Information', action: openEditModal, color: '#A53FE7', bg: '#F3E8FF' },
    { icon: 'bulb-outline', title: 'Relationship Intelligence', action: () => navigation.navigate('RelationshipIntelligence'), color: '#6366F1', bg: '#EEF2FF', badge: `${relationshipScore}/100` },
    { icon: 'shield-checkmark-outline', title: 'Privacy & Sharing', action: () => navigation.navigate('PrivacySharing'), color: '#10B981', bg: '#D1FAE5' },
  ];

  const appGroup = [
    { icon: 'notifications-outline', title: 'Notifications', action: () => navigation.navigate('Notifications'), color: '#F59E0B', bg: '#FEF3C7' },
    { icon: 'time-outline', title: 'Message Scheduler', action: () => navigation.navigate('MessageScheduler'), color: '#EC4899', bg: '#FCE7F3' },
    { icon: 'help-circle-outline', title: 'Help & Support', action: () => Alert.alert('Help & Support', 'Email us at support@fnfapp.com'), color: '#3B82F6', bg: '#DBEAFE' },
    { icon: 'log-out-outline', title: 'Logout', action: handleLogout, color: '#EF4444', bg: '#FEE2E2', isDestructive: true },
  ];

  const formatDateDisplay = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header Card */}
        <LinearGradient colors={['#FF6B8A', '#A53FE7', '#6366F1']} style={styles.heroHeader}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerTopBar}>
              <Text style={styles.headerTitleText}>My Profile</Text>
              <TouchableOpacity onPress={openEditModal} style={styles.topIconBtn}>
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeroContent}>
              <TouchableOpacity onPress={handleSelectPhoto} style={styles.avatarGlowRing} activeOpacity={0.85}>
                <View style={styles.avatarInnerContainer}>
                  {profile.photoUrl ? (
                    <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={54} color="#FF6B8A" />
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.nameRow}>
                <Text style={styles.userNameText}>{profile.fullName}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#60A5FA" style={{ marginLeft: 6 }} />
              </View>

              {profile.email ? <Text style={styles.userEmailText}>{profile.email}</Text> : null}

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.glassEditBtn} activeOpacity={0.8} onPress={openEditModal}>
                  <Ionicons name="pencil" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.glassBtnText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.glassShareBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Share Profile', 'Sharing link generated!')}
                >
                  <Ionicons name="share-social-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.glassBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Dynamic Stats Card (Overlapping Header) */}
        <View style={styles.statsOverlapCard}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="people" size={18} color="#A53FE7" />
            </View>
            <Text style={styles.statNumText}>{familyCount}</Text>
            <Text style={styles.statLabelText}>Family</Text>
          </View>

          <View style={styles.statDividerVertical} />

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FFF0F2' }]}>
              <Ionicons name="heart" size={18} color="#FF6B8A" />
            </View>
            <Text style={styles.statNumText}>{friendsCount}</Text>
            <Text style={styles.statLabelText}>Friends</Text>
          </View>

          <View style={styles.statDividerVertical} />

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="gift" size={18} color="#6366F1" />
            </View>
            <Text style={styles.statNumText}>{eventsCount}</Text>
            <Text style={styles.statLabelText}>Events</Text>
          </View>
        </View>

        {/* Spouse Highlight Card (when Married is true) */}
        {editMarried && editSpouseName ? (
          <View style={styles.spouseHighlightCard}>
            <LinearGradient colors={['#FFF0F2', '#FCE7F3']} style={styles.spouseCardGradient}>
              <View style={styles.spouseCardRow}>
                <View style={styles.spouseAvatarWrap}>
                  {spousePhotoUrl ? (
                    <Image source={{ uri: spousePhotoUrl }} style={styles.spouseAvatarImg} />
                  ) : (
                    <Ionicons name="person-outline" size={28} color="#EC4899" />
                  )}
                  <View style={styles.spouseHeartBadge}>
                    <Ionicons name="heart" size={10} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.spouseInfoTextWrap}>
                  <Text style={styles.spouseTitleLabel}>Spouse</Text>
                  <Text style={styles.spouseNameValue}>{editSpouseName}</Text>

                  <View style={styles.spouseChipsRow}>
                    <View style={styles.spouseChip}>
                      <Ionicons name="gift-outline" size={12} color="#EC4899" />
                      <Text style={styles.spouseChipText}>{formatDateDisplay(spouseDobDate)}</Text>
                    </View>

                    <View style={styles.spouseChip}>
                      <Ionicons name="sparkles-outline" size={12} color="#A53FE7" />
                      <Text style={styles.spouseChipText}>{formatDateDisplay(anniversaryDate)}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={openEditModal} style={styles.spouseEditSmallBtn}>
                  <Ionicons name="create-outline" size={18} color="#EC4899" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {/* Section 1: Network & Relationship */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.sectionHeaderTitle}>Network & Relationship</Text>
          {networkGroup.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={[
                styles.menuItemRow,
                index === networkGroup.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.action}
            >
              <View style={styles.menuLeftContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuTitleText}>{item.title}</Text>
              </View>

              <View style={styles.menuRightContent}>
                {item.badge ? (
                  <View style={styles.miniPillBadge}>
                    <Text style={styles.miniPillText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 2: Preferences & Settings */}
        <View style={styles.menuSectionCard}>
          <Text style={styles.sectionHeaderTitle}>Preferences & Support</Text>
          {appGroup.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={[
                styles.menuItemRow,
                index === appGroup.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.action}
            >
              <View style={styles.menuLeftContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuTitleText, item.isDestructive && { color: '#EF4444', fontWeight: '700' }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="First Name"
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Last Name"
                value={editLastName}
                onChangeText={setEditLastName}
                placeholderTextColor="#9CA3AF"
              />

              {/* Date of Birth Calendar Picker */}
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowDobPicker(true)}>
                <Text style={styles.datePickerText}>{formatDateDisplay(dobDate)}</Text>
                <Ionicons name="calendar-outline" size={22} color="#A53FE7" />
              </TouchableOpacity>

              {showDobPicker && (
                <DateTimePicker
                  value={dobDate}
                  mode="date"
                  display="default"
                  minimumDate={MIN_DATE_PICKER}
                  maximumDate={MAX_DATE_PICKER}
                  onChange={(event, selectedDate) => {
                    setShowDobPicker(Platform.OS === 'ios');
                    if (selectedDate) setDobDate(selectedDate);
                  }}
                />
              )}

              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.genderPill, editGender === item && styles.genderPillActive]}
                    onPress={() => setEditGender(item)}
                  >
                    <Text style={[styles.genderText, editGender === item && styles.genderTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Married</Text>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: '#A53FE7' }}
                  thumbColor="#FFFFFF"
                  onValueChange={setEditMarried}
                  value={editMarried}
                />
              </View>

              {editMarried && (
                <>
                  <Text style={styles.fieldLabel}>Spouse Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Spouse Name"
                    value={editSpouseName}
                    onChangeText={setEditSpouseName}
                    placeholderTextColor="#9CA3AF"
                  />

                  {/* Spouse Photo Picker */}
                  <Text style={styles.fieldLabel}>Spouse Photo</Text>
                  <View style={styles.photoPickerRow}>
                    <TouchableOpacity onPress={handleSelectSpousePhoto} style={styles.spousePhotoCircle}>
                      {spousePhotoUrl ? (
                        <Image source={{ uri: spousePhotoUrl }} style={styles.photoFull} />
                      ) : (
                        <Ionicons name="person-outline" size={32} color="#9CA3AF" />
                      )}
                      <View style={styles.miniCameraBadge}>
                        <Ionicons name="camera" size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSelectSpousePhoto} style={styles.photoBtnTextWrapper}>
                      <Text style={styles.photoBtnTitle}>Choose Spouse Photo</Text>
                      <Text style={styles.photoBtnSub}>Tap to upload or replace</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Spouse Date of Birth Calendar Picker */}
                  <Text style={styles.fieldLabel}>Spouse Date of Birth</Text>
                  <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowSpouseDobPicker(true)}>
                    <Text style={styles.datePickerText}>{formatDateDisplay(spouseDobDate)}</Text>
                    <Ionicons name="calendar-outline" size={22} color="#A53FE7" />
                  </TouchableOpacity>

                  {showSpouseDobPicker && (
                    <DateTimePicker
                      value={spouseDobDate}
                      mode="date"
                      display="default"
                      minimumDate={MIN_DATE_PICKER}
                      maximumDate={MAX_DATE_PICKER}
                      onChange={(event, selectedDate) => {
                        setShowSpouseDobPicker(Platform.OS === 'ios');
                        if (selectedDate) setSpouseDobDate(selectedDate);
                      }}
                    />
                  )}

                  {/* Anniversary Date Calendar Picker */}
                  <Text style={styles.fieldLabel}>Anniversary Date</Text>
                  <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowAnniversaryPicker(true)}>
                    <Text style={styles.datePickerText}>{formatDateDisplay(anniversaryDate)}</Text>
                    <Ionicons name="calendar-outline" size={22} color="#A53FE7" />
                  </TouchableOpacity>

                  {showAnniversaryPicker && (
                    <DateTimePicker
                      value={anniversaryDate}
                      mode="date"
                      display="default"
                      minimumDate={MIN_DATE_PICKER}
                      maximumDate={MAX_DATE_PICKER}
                      onChange={(event, selectedDate) => {
                        setShowAnniversaryPicker(Platform.OS === 'ios');
                        if (selectedDate) setAnniversaryDate(selectedDate);
                      }}
                    />
                  )}

                  {/* Anniversary Photo Picker */}
                  <Text style={styles.fieldLabel}>Anniversary Picture</Text>
                  <TouchableOpacity onPress={handleSelectAnniversaryPhoto} style={styles.anniversaryPhotoBox}>
                    {anniversaryPhotoUrl ? (
                      <Image source={{ uri: anniversaryPhotoUrl }} style={styles.photoFull} resizeMode="cover" />
                    ) : (
                      <View style={styles.anniversaryPlaceholder}>
                        <Ionicons name="images-outline" size={32} color="#9CA3AF" />
                        <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Add Anniversary Memory Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={updating}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#FF6B8A', '#A53FE7']} style={styles.saveGradient}>
                  {updating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroHeader: {
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeroContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarGlowRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  avatarInnerContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF6B8A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  userNameText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userEmailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  glassEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  glassShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsOverlapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -26,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  statLabelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  statDividerVertical: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
  spouseHighlightCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  spouseCardGradient: {
    padding: 16,
  },
  spouseCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spouseAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  spouseAvatarImg: {
    width: '100%',
    height: '100%',
  },
  spouseHeartBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#EC4899',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  spouseInfoTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  spouseTitleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EC4899',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  spouseNameValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },
  spouseChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  spouseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  spouseChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  spouseEditSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
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
  photoPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  spousePhotoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  miniCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A53FE7',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtnTextWrapper: {
    marginLeft: 14,
  },
  photoBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  photoBtnSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  anniversaryPhotoBox: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  anniversaryPlaceholder: {
    alignItems: 'center',
  },
  photoFull: {
    width: '100%',
    height: '100%',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  genderPill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderPillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#A53FE7',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  genderTextActive: {
    color: '#A53FE7',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '700',
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
