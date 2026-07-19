import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_CONTACTS = [
  { id: '1', name: 'Rahul Sharma', mutual: '12 mutual friends', image: 'https://i.pravatar.cc/150?img=12' },
  { id: '2', name: 'Sneha Verma', mutual: '8 mutual friends', image: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Vikram Mehta', mutual: '3 mutual friends', image: 'https://i.pravatar.cc/150?img=8' },
  { id: '4', name: 'Priya Singh', mutual: '15 mutual friends', image: 'https://i.pravatar.cc/150?img=9' },
  { id: '5', name: 'Aman Tiwari', mutual: '5 mutual friends', image: 'https://i.pravatar.cc/150?img=15' },
];

export default function ContactDiscoveryScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: typeof MOCK_CONTACTS[0] }) => (
    <View style={styles.contactItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutual}</Text>
      </View>
      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7E57C2', '#9575CD']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Discover People</Text>
            <Text style={styles.headerSubtitle}>Find and connect with your friends and family.</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
          />
        </View>
      </LinearGradient>

      <FlatList
        data={MOCK_CONTACTS}
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
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
  },
  contactItem: {
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 13,
    color: '#777',
  },
  connectButton: {
    backgroundColor: '#7E57C2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
