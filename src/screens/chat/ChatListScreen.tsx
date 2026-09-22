import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Avatar, Card } from '../../components';

const MOCK_CHATS = [
  { id: '1', name: 'Family Group', message: 'Happy Birthday Dad! 🎂', time: '10:30 AM', image: 'https://i.pravatar.cc/150?img=33', unread: 3, online: true },
  { id: '2', name: 'Pooja Mehra', message: 'Voice message', time: 'Yesterday', image: 'https://i.pravatar.cc/150?img=5', unread: 1, online: true },
  { id: '3', name: 'Karan Mehra', message: "Let's catch up!", time: 'Yesterday', image: 'https://i.pravatar.cc/150?img=11', unread: 0, online: false },
  { id: '4', name: 'Best Friends', message: 'Are we still on for tonight?', time: 'Mon', image: 'https://i.pravatar.cc/150?img=20', unread: 0, online: false },
  { id: '5', name: 'Mom', message: 'Thanks beta ❤️', time: 'Sun', image: 'https://i.pravatar.cc/150?img=9', unread: 0, online: true },
];

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();
  const [search, setSearch] = useState('');

  const filteredChats = MOCK_CHATS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof MOCK_CHATS[0] }) => (
    <Card
      variant="elevated"
      onPress={() => navigation.navigate('PersonalChat' as never)}
      style={styles.chatCard}
    >
      <Avatar name={item.name} source={item.image} size="lg" online={item.online} />

      <View style={styles.chatInfo}>
        <View style={styles.topNameRow}>
          <Text style={[styles.chatName, { color: colors.textPrimary, fontWeight: typography.fontWeight.bold }]}>
            {item.name}
          </Text>
          <Text style={[styles.chatTime, { color: item.unread > 0 ? colors.primary : colors.textMuted }]}>
            {item.time}
          </Text>
        </View>

        <View style={styles.bottomMessageRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.chatMessage,
              {
                color: item.unread > 0 ? colors.textPrimary : colors.textSecondary,
                fontWeight: item.unread > 0 ? typography.fontWeight.semibold : typography.fontWeight.regular,
              },
            ]}
          >
            {item.message}
          </Text>

          {item.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary, borderRadius: borderRadius.full }]}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradientPrimary} style={styles.headerGradient}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontWeight: typography.fontWeight.heavy }]}>
              Conversations
            </Text>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.white }, shadows.sm]}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search conversations..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.fab, shadows.primaryGlow]}
        onPress={() => navigation.navigate('MessageScheduler' as never)}
      >
        <LinearGradient colors={colors.gradientPrimary} style={styles.fabGradient}>
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  topNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
  },
  chatTime: {
    fontSize: 12,
  },
  bottomMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
