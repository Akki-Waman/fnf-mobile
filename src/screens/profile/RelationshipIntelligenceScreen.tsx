import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RelationshipIntelligenceScreen() {
  const navigation = useNavigation();

  const stats = [
    { label: 'Family Members', value: '24', icon: 'people', color: '#7E57C2' },
    { label: 'Friends', value: '156', icon: 'person-add', color: '#FF8A65' },
    { label: 'Upcoming Celebrations', value: '2', icon: 'gift', color: '#FFCA28' },
    { label: 'People Not Wished', value: '8', icon: 'warning', color: '#EF5350' },
    { label: 'Recent Memories', value: '18', icon: 'images', color: '#29B6F6' },
    { label: 'Friend Activity', value: 'High', icon: 'trending-up', color: '#66BB6A', isText: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relationship Intelligence</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#7E57C2', '#9575CD']}
          style={styles.scoreCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.scoreTitle}>Your Relationship Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>85</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.scoreSubtitle}>Excellent</Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statRow}>
              <View style={styles.statLeft}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={[
                styles.statValue,
                stat.isText && { color: stat.color, fontSize: 16 }
              ]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#7E57C2',
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 18,
  },
  scoreSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});
