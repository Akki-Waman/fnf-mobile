import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'birthday', title: 'Birthday Reminder', message: 'It\'s Dad\'s birthday today!', unread: true, color: '#FF7043', icon: 'gift' },
  { id: '2', type: 'scheduled', title: 'Scheduled Message', message: 'Your wish will be sent tomorrow', unread: true, color: '#7E57C2', icon: 'calendar' },
  { id: '3', type: 'memory', title: 'New Memory', message: 'Anita added a new memory', unread: false, color: '#29B6F6', icon: 'images' },
  { id: '4', type: 'anniversary', title: 'Anniversary Reminder', message: 'Parents anniversary tomorrow', unread: false, color: '#FFCA28', icon: 'heart' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  const filteredNotifications = activeTab === 'Unread' 
    ? MOCK_NOTIFICATIONS.filter(n => n.unread) 
    : MOCK_NOTIFICATIONS;

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <View style={[styles.notificationItem, item.unread && styles.unreadItem]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.notificationInfo}>
        <Text style={[styles.notificationTitle, item.unread && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7E57C2', '#AB47BC']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'All' && styles.activeTab]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Unread' && styles.activeTab]}
            onPress={() => setActiveTab('Unread')}
          >
            <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>
              Unread
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No notifications here!</Text>
          </View>
        }
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
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  unreadItem: {
    backgroundColor: '#F3E5F5', // very light purple tint for unread
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  unreadText: {
    color: '#333',
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#777',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7E57C2',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
