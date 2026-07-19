import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EventDetailsScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#FF7043', '#AB47BC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>Dad's Birthday</Text>
          <Text style={styles.eventDate}>28 May 2024</Text>

          <View style={styles.illustrationContainer}>
            {/* Placeholder for illustration */}
            <Ionicons name="gift" size={120} color="rgba(255,255,255,0.8)" />
          </View>

          <View style={styles.countdownContainer}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeValue}>05</Text>
              <Text style={styles.timeLabel}>Days</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeValue}>12</Text>
              <Text style={styles.timeLabel}>Hrs</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeValue}>45</Text>
              <Text style={styles.timeLabel}>Mins</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Send Wish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('MessageScheduler' as never)}>
              <Text style={styles.secondaryButtonText}>Schedule Wish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('PersonalChat' as never)}>
              <Text style={styles.secondaryButtonText}>Open Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.textButton} onPress={() => navigation.navigate('Memories' as never)}>
              <Text style={styles.textButtonText}>View Memories</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  eventName: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 30,
  },
  illustrationContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  timeBlock: {
    alignItems: 'center',
    width: 60,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginHorizontal: 10,
    paddingBottom: 20, // Adjust alignment with numbers
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FF7043',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
