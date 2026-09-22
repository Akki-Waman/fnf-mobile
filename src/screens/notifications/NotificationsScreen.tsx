import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { intelligenceApi } from '../../services/intelligenceApi';

const DEFAULT_NOTIFICATIONS = [
  { id: '1', type: 'birthday', title: 'Birthday Reminder', message: "It's Dad's birthday today!", unread: true, color: '#FF6B8A', icon: 'gift' },
  { id: '2', type: 'scheduled', title: 'Scheduled Message', message: 'Your wish will be sent Tomorrow', unread: true, color: '#9333EA', icon: 'calendar' },
  { id: '3', type: 'memory', title: 'New Memory', message: 'Amrita added a memory', unread: false, color: '#2563EB', icon: 'images' },
  { id: '4', type: 'anniversary', title: 'Anniversary Reminder', message: 'Parents Anniversary Tomorrow', unread: false, color: '#EA580C', icon: 'heart' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await intelligenceApi.getNotifications();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.log('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const filteredNotifications = activeTab === 'Unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const renderItem = ({ item }: { item: typeof DEFAULT_NOTIFICATIONS[0] }) => (
    <View style={[styles.notificationCard, item.unread && styles.unreadCard]}>
      <View style={[styles.iconBox, { backgroundColor: (item.color || '#9333EA') + '15' }]}>
        <Ionicons name={(item.icon as any) || 'notifications'} size={22} color={item.color || '#9333EA'} />
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, item.unread && styles.unreadTitleText]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>

      {item.unread && <View style={styles.unreadBadgeDot} />}
    </View>
  );

  return (
    <LinearGradient colors={['#FF6B8A', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'All' && styles.activeTabBtn]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Unread' && styles.activeTabBtn]}
            onPress={() => setActiveTab('Unread')}
          >
            <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>
              Unread
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentBody}>
          {loading ? (
            <ActivityIndicator size="large" color="#9333EA" style={{ marginVertical: 40 }} />
          ) : (
            <FlatList
              data={filteredNotifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="notifications-off-outline" size={54} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No unread notifications</Text>
                </View>
              }
            />
          )}

          <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={['#9333EA', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewAllGradient}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
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
  listPadding: {
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unreadCard: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FCE7F3',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  unreadTitleText: {
    color: '#111827',
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6B7280',
  },
  unreadBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B8A',
    marginLeft: 10,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
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
