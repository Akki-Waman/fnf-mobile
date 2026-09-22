import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const INITIAL_MESSAGES = [
  { id: '1', text: 'Happy Birthday Dad! 🎂\nWishing you good health and happiness always.', sender: 'me', time: '10:15 AM', isSpecial: true },
  { id: '2', text: 'Thank you beta! ❤️', sender: 'them', time: '10:20 AM' },
];

export default function PersonalChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      text: inputText.trim(),
      sender: 'me',
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: typeof INITIAL_MESSAGES[0] }) => {
    const isMe = item.sender === 'me';

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && (
          <View style={styles.messageAvatar}>
            <Ionicons name="person" size={18} color="#FF6B8A" />
          </View>
        )}

        <View style={isMe ? styles.bubbleContainerMe : styles.bubbleContainerThem}>
          {item.isSpecial ? (
            <LinearGradient colors={['#FF6B8A', '#FF9A62']} style={[styles.messageBubble, styles.specialBubble]}>
              <Text style={styles.specialText}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.messageText, isMe ? styles.textMe : styles.textThem]}>
                {item.text}
              </Text>
            </View>
          )}
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFF5F5', '#F5F3FF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <LinearGradient colors={['#FF6B8A', '#A53FE7']} style={styles.headerGradient}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.headerAvatar}>
                <Ionicons name="person" size={20} color="#FF6B8A" />
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>Pooja Mehra</Text>
                <Text style={styles.headerStatus}>Online</Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="videocam-outline" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="call-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.clipBtn}>
              <Ionicons name="attach" size={22} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <LinearGradient colors={['#FF6B8A', '#A53FE7']} style={styles.sendGradient}>
                <Ionicons name="send" size={18} color="white" style={{ marginLeft: 2 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  headerGradient: {
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chatList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubbleContainerMe: {
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  bubbleContainerThem: {
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: '#A53FE7',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specialBubble: {
    borderBottomRightRadius: 4,
    elevation: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textMe: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textThem: {
    color: '#111827',
    fontWeight: '500',
  },
  specialText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginLeft: 10,
    elevation: 3,
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
