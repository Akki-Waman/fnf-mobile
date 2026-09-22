import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_REQUESTS = [
  { id: '1', name: 'Neha Sharma', mutual: '4 mutual friends' },
  { id: '2', name: 'Rohan Verma', mutual: '2 mutual friends' },
  { id: '3', name: 'Kavya Joshi', mutual: 'No mutual friends' },
  { id: '4', name: 'Dev Patel', mutual: '7 mutual friends' },
];

export default function FriendRequestsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'Received' | 'Sent'>('Received');

  const renderItem = ({ item }: { item: typeof MOCK_REQUESTS[0] }) => (
    <View style={styles.requestCard}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#9333EA" />
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutual}</Text>
      </View>
      <View style={styles.actionButtons}>
        {activeTab === 'Received' ? (
          <>
            <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#9333EA', '#6366F1']} style={styles.btnGradient}>
                <Text style={styles.acceptText}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineBtn} activeOpacity={0.8}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.declineBtn} activeOpacity={0.8}>
            <Text style={styles.declineText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#6366F1', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend Requests</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Received' && styles.activeTabBtn]}
            onPress={() => setActiveTab('Received')}
          >
            <Text style={[styles.tabText, activeTab === 'Received' && styles.activeTabText]}>
              Received
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Sent' && styles.activeTabBtn]}
            onPress={() => setActiveTab('Sent')}
          >
            <Text style={[styles.tabText, activeTab === 'Sent' && styles.activeTabText]}>
              Sent
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentBody}>
          <FlatList
            data={MOCK_REQUESTS}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={['#9333EA', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewAllGradient}
            >
              <Text style={styles.viewAllText}>View All Requests</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    color: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeTabText: {
    color: '#A53FE7',
    fontWeight: '700',
  },
  contentBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 6,
  },
  btnGradient: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  acceptText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  declineText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  viewAllBtn: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  viewAllGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
