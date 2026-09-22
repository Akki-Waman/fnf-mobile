import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const DEFAULT_MEMORIES = [
  { id: '1', type: 'photo', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80', height: 180 },
  { id: '2', type: 'photo', url: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?w=500&q=80', height: 150 },
  { id: '3', type: 'photo', url: 'https://images.unsplash.com/photo-1533227260828-531c6b715025?w=500&q=80', height: 160 },
  { id: '4', type: 'video', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&q=80', height: 200 },
  { id: '5', type: 'photo', url: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=500&q=80', height: 150 },
  { id: '6', type: 'photo', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&q=80', height: 170 },
];

const TABS = ['All', 'Photos', 'Videos', 'Albums'];

export default function MemoriesScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [memories, setMemories] = useState(DEFAULT_MEMORIES);

  useEffect(() => {
    const loadVault = async () => {
      try {
        const res = await apiClient.get('/vault/list');
        if (res.data?.success && Array.isArray(res.data?.data?.content)) {
          const items = res.data.data.content.map((m: any, idx: number) => ({
            id: String(m.memoryId || idx),
            type: m.mediaType?.toLowerCase() || 'photo',
            url: m.cloudAssetUrl || m.mediaUrl || DEFAULT_MEMORIES[idx % DEFAULT_MEMORIES.length].url,
            height: 160 + (idx % 3) * 20,
          }));
          if (items.length > 0) setMemories(items);
        }
      } catch (e) {
        console.log('Vault fetch error:', e);
      }
    };
    loadVault();
  }, []);

  const renderItem = ({ item }: { item: typeof DEFAULT_MEMORIES[0] }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
      <Image source={{ uri: item.url }} style={[styles.image, { height: item.height }]} resizeMode="cover" />
      {item.type === 'video' && (
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.9)" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#FF9A62', '#FF6B8A', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memories</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentBody}>
          <FlatList
            data={memories}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FF6B8A',
    fontWeight: '700',
  },
  contentBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageContainer: {
    width: COLUMN_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
});
