import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { profileApi } from '../../services/profileApi';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function PrivacySharingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [familyEnabled, setFamilyEnabled] = useState(true);
  const [bestFriendsEnabled, setBestFriendsEnabled] = useState(true);
  const [friendsEnabled, setFriendsEnabled] = useState(true);
  const [relativesEnabled, setRelativesEnabled] = useState(false);

  const handleToggle = async (
    field: 'family' | 'bestFriends' | 'friends' | 'relatives',
    value: boolean
  ) => {
    let nextFamily = familyEnabled;
    let nextFriends = friendsEnabled;
    let nextRelatives = relativesEnabled;

    if (field === 'family') { setFamilyEnabled(value); nextFamily = value; }
    if (field === 'bestFriends') { setBestFriendsEnabled(value); }
    if (field === 'friends') { setFriendsEnabled(value); nextFriends = value; }
    if (field === 'relatives') { setRelativesEnabled(value); nextRelatives = value; }

    try {
      await profileApi.updatePrivacy({
        allowFamilyVisibility: nextFamily,
        allowFriendVisibility: nextFriends,
        allowRelativeVisibility: nextRelatives,
      });
    } catch (e) {
      console.log('Update privacy error:', e);
    }
  };

  return (
    <LinearGradient colors={['#9333EA', '#4F46E5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Sharing</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Choose who can see and interact{'\n'}with your content.
          </Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Family</Text>
                <Text style={styles.settingDesc}>Visible to all family members</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#9333EA' }}
                thumbColor={'#FFFFFF'}
                onValueChange={(val) => handleToggle('family', val)}
                value={familyEnabled}
              />
            </View>
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Best Friends</Text>
                <Text style={styles.settingDesc}>Visible to best friends</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#9333EA' }}
                thumbColor={'#FFFFFF'}
                onValueChange={(val) => handleToggle('bestFriends', val)}
                value={bestFriendsEnabled}
              />
            </View>
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Friends</Text>
                <Text style={styles.settingDesc}>Visible to friends</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#9333EA' }}
                thumbColor={'#FFFFFF'}
                onValueChange={(val) => handleToggle('friends', val)}
                value={friendsEnabled}
              />
            </View>
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Relatives</Text>
                <Text style={styles.settingDesc}>Visible to relatives</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#9333EA' }}
                thumbColor={'#FFFFFF'}
                onValueChange={(val) => handleToggle('relatives', val)}
                value={relativesEnabled}
              />
            </View>
          </View>
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
    paddingVertical: 14,
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
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
});
