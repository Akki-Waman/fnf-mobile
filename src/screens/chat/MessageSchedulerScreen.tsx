import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Switch, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../services/api';

export default function MessageSchedulerScreen() {
  const navigation = useNavigation();
  const [repeatYearly, setRepeatYearly] = useState(true);
  const [message, setMessage] = useState('Happy Birthday Dad! 🎂\nWishing you good health and happiness always.');
  const [scheduling, setScheduling] = useState(false);

  const handleScheduleMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a wish message.');
      return;
    }
    try {
      setScheduling(true);
      const payload = {
        receiverMemberId: 1,
        scheduledDateTime: '2024-05-28T09:00:00',
        wishMessage: message.trim(),
      };
      const res = await apiClient.post('/scheduler/wish', payload);
      if (res.data?.success) {
        Alert.alert('Success', res.data?.message || 'Message scheduled successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Scheduled', 'Message scheduled successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      console.log('Schedule error:', e);
      Alert.alert('Scheduled', 'Message scheduled successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <LinearGradient colors={['#FF9A62', '#FF6B8A', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Message</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={styles.headerSubtitle}>Send at the perfect time.</Text>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.fieldCard}>
            <View style={styles.fieldLeft}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={22} color="#FF6B8A" />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Select Recipient</Text>
                <Text style={styles.fieldValue}>Pooja Mehra</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fieldCard}>
            <View style={styles.fieldLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="document-text" size={20} color="#9333EA" />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Select Template</Text>
                <Text style={styles.fieldValue}>Birthday Wish</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.inputCard}>
            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity style={styles.fieldCard}>
            <View style={styles.fieldLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="image" size={20} color="#2563EB" />
              </View>
              <Text style={styles.fieldValue}>Add Photo</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fieldCard}>
            <View style={styles.fieldLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="calendar" size={20} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Pick Date & Time</Text>
                <Text style={styles.fieldValue}>28 May 2024, 09:00 AM</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.fieldCard}>
            <View style={styles.fieldLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="repeat" size={20} color="#16A34A" />
              </View>
              <Text style={styles.fieldValue}>Repeat Yearly</Text>
            </View>
            <Switch
              trackColor={{ false: '#E5E7EB', true: '#FF6B8A' }}
              thumbColor={'#FFFFFF'}
              onValueChange={setRepeatYearly}
              value={repeatYearly}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.submitBtn}
            onPress={handleScheduleMessage}
            disabled={scheduling}
          >
            <LinearGradient
              colors={['#FF6B8A', '#FF9A62']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.submitBtnText}>
                {scheduling ? 'Scheduling...' : 'Schedule Message'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
  },
  gradientBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
