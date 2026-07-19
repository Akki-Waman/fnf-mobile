import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MessageSchedulerScreen() {
  const navigation = useNavigation();
  const [repeatYearly, setRepeatYearly] = useState(true);
  const [message, setMessage] = useState('Happy Birthday Dad! 🎉\nWishing you good health and happiness always.');

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FF8A65', '#FF7043']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Message</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.headerSubtitle}>Send at the perfect time.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.fieldRow}>
          <View style={styles.fieldLeft}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.fieldAvatar} />
            <View>
              <Text style={styles.fieldLabel}>Select Recipient</Text>
              <Text style={styles.fieldValue}>Pooja Mehra</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fieldRow}>
          <View style={styles.fieldLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={20} color="#7E57C2" />
            </View>
            <View>
              <Text style={styles.fieldLabel}>Select Template</Text>
              <Text style={styles.fieldValue}>Birthday Wish</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Message</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
            />
          </View>
        </View>

        <TouchableOpacity style={styles.fieldRow}>
          <View style={styles.fieldLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="image" size={20} color="#2196F3" />
            </View>
            <Text style={styles.fieldValue}>Add Photo</Text>
          </View>
          <Ionicons name="add-circle-outline" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fieldRow}>
          <View style={styles.fieldLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FBE9E7' }]}>
              <Ionicons name="calendar" size={20} color="#FF7043" />
            </View>
            <View>
              <Text style={styles.fieldLabel}>Pick Date & Time</Text>
              <Text style={styles.fieldValue}>28 May 2024, 09:00 AM</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.fieldRow}>
          <View style={styles.fieldLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="repeat" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.fieldValue}>Repeat Yearly</Text>
          </View>
          <Switch
            trackColor={{ false: '#d3d3d3', true: '#FF8A65' }}
            thumbColor={'#fff'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setRepeatYearly}
            value={repeatYearly}
          />
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <LinearGradient colors={['#FF8A65', '#FF7043']} style={styles.submitGradient}>
            <Text style={styles.submitButtonText}>Schedule Message</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
  },
  textInput: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  submitButton: {
    marginTop: 20,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
