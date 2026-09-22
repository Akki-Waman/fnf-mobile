import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const eventName = route.params?.title || "Dad's Birthday";
  const eventDate = route.params?.subtitle || 'May 28, 2024';

  return (
    <LinearGradient colors={['#A53FE7', '#EC4899']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>{eventName}</Text>
          <Text style={styles.eventDate}>{eventDate}</Text>

          <View style={styles.countdownRing}>
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
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PersonalChat' as never)}>
              <LinearGradient colors={['#FF6B8A', '#FF9A62']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                <Text style={styles.actionBtnText}>Send Wish</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MessageScheduler' as never)}>
              <LinearGradient colors={['#9333EA', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                <Text style={styles.actionBtnText}>Schedule Wish</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('PersonalChat' as never)}>
              <Text style={styles.secondaryBtnText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Memories' as never)}>
              <Text style={styles.outlineBtnText}>View Memories</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  eventName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: -10,
  },
  countdownRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  actionsContainer: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
  },
  gradientBtn: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  outlineBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
