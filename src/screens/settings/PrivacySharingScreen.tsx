import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function PrivacySharingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [familyEnabled, setFamilyEnabled] = useState(true);
  const [bestFriendsEnabled, setBestFriendsEnabled] = useState(false);
  const [friendsEnabled, setFriendsEnabled] = useState(true);
  const [relativesEnabled, setRelativesEnabled] = useState(false);

  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(previousState => !previousState);
  };

  return (
    <LinearGradient colors={['#7E57C2', '#FF8A65']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Sharing</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Choose who can see and interact with your content.</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Family</Text>
                <Text style={styles.settingDesc}>Visible to all family members</Text>
              </View>
              <Switch
                trackColor={{ false: '#d3d3d3', true: '#FF8A65' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(setFamilyEnabled)}
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
                trackColor={{ false: '#d3d3d3', true: '#FF8A65' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(setBestFriendsEnabled)}
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
                trackColor={{ false: '#d3d3d3', true: '#FF8A65' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(setFriendsEnabled)}
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
                trackColor={{ false: '#d3d3d3', true: '#FF8A65' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(setRelativesEnabled)}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
  },
});
