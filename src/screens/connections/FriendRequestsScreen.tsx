import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_REQUESTS = [
  { id: '1', name: 'Neha Sharma', mutual: '4 mutual friends', image: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Rohan Verma', mutual: '2 mutual friends', image: 'https://i.pravatar.cc/150?img=13' },
  { id: '3', name: 'Kavya Joshi', mutual: 'No mutual friends', image: 'https://i.pravatar.cc/150?img=19' },
  { id: '4', name: 'Dev Patel', mutual: '7 mutual friends', image: 'https://i.pravatar.cc/150?img=11' },
];

export default function FriendRequestsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'Received' | 'Sent'>('Received');

  const renderItem = ({ item }: { item: typeof MOCK_REQUESTS[0] }) => (
    <View style={styles.requestItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutual}</Text>
      </View>
      <View style={styles.actionButtons}>
        {activeTab === 'Received' ? (
          <>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7E57C2', '#9575CD']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend Requests</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Received' && styles.activeTab]}
            onPress={() => setActiveTab('Received')}
          >
            <Text style={[styles.tabText, activeTab === 'Received' && styles.activeTabText]}>
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Sent' && styles.activeTab]}
            onPress={() => setActiveTab('Sent')}
          >
            <Text style={[styles.tabText, activeTab === 'Sent' && styles.activeTabText]}>
              Sent
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={MOCK_REQUESTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#7E57C2',
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#777',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#7E57C2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  declineButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});
