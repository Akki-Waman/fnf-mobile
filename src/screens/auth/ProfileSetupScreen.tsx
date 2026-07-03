import React, { useState } from 'react';
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
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;
};

export default function ProfileSetupScreen({ navigation }: Props) {
  const { completeAuth } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);

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
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First Name and Last Name are required.');
      return;
    }

    try {
      const formattedDate = dateOfBirth.toISOString().split('T')[0];

    const payload = {
  firstName: firstName,
  lastName: lastName,
  dateOfBirth: formattedDate,
  gender: gender,
  profilePhotoUrl: image, 
};

      const response = await apiClient.post('/auth/create-profile', payload);

      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Profile created successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => completeAuth() 
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create profile.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
  };

  return (
    <LinearGradient colors={['#7C3AED', '#EC4899', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Text style={styles.title}>Almost there!</Text>
            <Text style={styles.subtitle}>Let's set up your profile</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                {image ? <Image source={{ uri: image }} style={styles.avatarImage} /> : <Ionicons name="person" size={40} color="#D1D5DB" />}
              </View>
              <TouchableOpacity style={styles.cameraButton} onPress={handleSelectPhoto}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#9CA3AF" />
                <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#9CA3AF" />
                <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} />
              </View>

              <Text style={styles.sectionLabel}>Date of Birth</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
                <Text style={styles.dateText}>{dateOfBirth.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker value={dateOfBirth} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />
              )}

              <Text style={styles.sectionLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((item) => (
                  <TouchableOpacity key={item} style={[styles.genderPill, gender === item && styles.genderPillActive]} onPress={() => setGender(item)}>
                    <Text style={[styles.genderText, gender === item && styles.genderTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleCompleteSetup}>
                <Text style={styles.buttonText}>Complete Setup</Text>
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
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 60 },
  title: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9, marginTop: 8 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24 },
  avatarContainer: { alignItems: 'center', marginTop: -50, marginBottom: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  cameraButton: { position: 'absolute', bottom: 0, right: 140, backgroundColor: '#EC4899', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  inputContainer: { height: 58, borderRadius: 18, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 16 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' },
  dateText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#4B5563', marginTop: 10, marginBottom: 12, marginLeft: 4 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  genderPill: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  genderPillActive: { backgroundColor: '#FCE7F3', borderColor: '#EC4899' },
  genderText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  genderTextActive: { color: '#EC4899' },
  button: { height: 58, borderRadius: 18, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});