import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';
import {
  MIN_DATE_PICKER,
  MAX_DATE_PICKER,
  formatDateToYYYYMMDD,
  formatDateDisplay,
} from '../../util/dateUtils';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;
  route: RouteProp<AuthStackParamList, 'ProfileSetup'>;
};

export default function ProfileSetupScreen({ navigation, route }: Props) {
  const params = route?.params || {};
  const { completeAuth } = useAuth();
  const [fullName, setFullName] = useState(
    [params.firstName, params.lastName].filter(Boolean).join(' ') || ''
  );
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date('1998-05-28'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(params.profilePhotoUrl || null);

  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery permissions!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleCompleteSetup = async () => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || 'User';
    const lastName = parts.slice(1).join(' ') || '';

    try {
      const formattedDate = formatDateToYYYYMMDD(dateOfBirth);

      const payload: any = {
        firstName,
        first_name: firstName,
        lastName,
        last_name: lastName,
        gender,
        dateOfBirth: formattedDate,
        date_of_birth: formattedDate,
        profilePhotoUrl: image || null,
        profile_photo_url: image || null,
      };

      const response = await authApi.createProfile(payload);

      if (response.success) {
        if (image) {
          await AsyncStorage.setItem('@user_profile_photo', image);
        }
        await AsyncStorage.setItem('profileCompleted', 'true');
        completeAuth();
      } else {
        Alert.alert('Error', response.message || 'Failed to create profile.');
      }
    } catch (error: any) {
      console.log('Profile setup error:', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'Could not connect to the server.');
    }
  };

  const formattedDateString = dateOfBirth.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <LinearGradient
      colors={['#FF9A62', '#FF6B8A', '#A53FE7']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Text style={styles.title}>Let's set up your profile</Text>
            <Text style={styles.subtitle}>Help your family know you better</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity onPress={handleSelectPhoto} activeOpacity={0.8} style={styles.avatarTouchable}>
                <View style={styles.avatarPlaceholder}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={54} color="#D1D5DB" />
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="e.g. Akash Mehra"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.inputText}>{formattedDateString}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={MIN_DATE_PICKER}
                  maximumDate={MAX_DATE_PICKER}
                />
              )}

              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.genderPill, gender === item && styles.genderPillActive]}
                      onPress={() => setGender(item)}
                    >
                      <Text style={[styles.genderText, gender === item && styles.genderTextActive]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8} style={styles.continueBtn} onPress={handleCompleteSetup}>
                <LinearGradient
                  colors={['#FF6B8A', '#FF9A62']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.continueBtnText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 50, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 6, textAlign: 'center' },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
  },
  avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 20 },
  avatarTouchable: { position: 'relative' },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarImage: { width: '100%', height: '100%' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF5F6D',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: { paddingBottom: 30 },
  inputFieldGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  inputBox: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  inputText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  genderPill: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderPillActive: { backgroundColor: '#FFF0F2', borderColor: '#FF6B8A' },
  genderText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  genderTextActive: { color: '#FF6B8A', fontWeight: '700' },
  continueBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  gradientBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});