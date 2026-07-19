import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 20 padding on sides, 8 gap

const MOCK_MEMORIES = [
  { id: '1', type: 'photo', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80', height: 200 },
  { id: '2', type: 'photo', url: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?w=500&q=80', height: 150 },
  { id: '3', type: 'photo', url: 'https://images.unsplash.com/photo-1533227260828-531c6b715025?w=500&q=80', height: 180 },
  { id: '4', type: 'video', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&q=80', height: 220 },
  { id: '5', type: 'photo', url: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=500&q=80', height: 160 },
  { id: '6', type: 'photo', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&q=80', height: 190 },
];

const TABS = ['All', 'Photos', 'Videos', 'Albums'];

export default function MemoriesScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');

  const renderItem = ({ item }: { item: typeof MOCK_MEMORIES[0] }) => (
    <TouchableOpacity style={styles.imageContainer}>
      <Image 
        source={{ uri: item.url }} 
        style={[styles.image, { height: item.height }]} 
        resizeMode="cover" 
      />
      {item.type === 'video' && (
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FF8A65', '#FF7043']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memories</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={28} color="white" />
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
      </LinearGradient>

      <FlatList
        data={MOCK_MEMORIES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Needed to import ScrollView for the horizontal tabs
import { ScrollView } from 'react-native';

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
    marginBottom: 15,
  },
  backButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FF7043',
  },
  listContent: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageContainer: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});
