import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../services/api';
import { familyApi } from '../../services/familyApi';
import { intelligenceApi } from '../../services/intelligenceApi';

export default function RelationshipIntelligenceScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  // Dynamic Metrics State
  const [relationshipScore, setRelationshipScore] = useState(75);
  const [familyCount, setFamilyCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [notWishedCount, setNotWishedCount] = useState(0);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [activityTier, setActivityTier] = useState('High');

  useEffect(() => {
    const loadAllMetrics = async () => {
      try {
        setLoading(true);

        // 1. Dashboard backend metrics fallback
        let backendScore: number | null = null;
        let notWished = 0;
        let tier = 'High';
        try {
          const res = await intelligenceApi.getDashboardMetrics();
          if (res.success && res.data) {
            if (typeof res.data.relationship_score === 'number') {
              backendScore = res.data.relationship_score;
            }
            notWished = res.data.people_not_wished ?? 0;
            tier = res.data.activity_tier ?? 'High';
          }
        } catch (e) {
          console.log('Dashboard metrics error', e);
        }
        setNotWishedCount(notWished);

        // 2. Family Count
        let famCount = 0;
        try {
          const famRes = await familyApi.getFamilyTree();
          if (famRes.success && famRes.data) {
            if (Array.isArray(famRes.data.familyMembers)) {
              famCount = famRes.data.familyMembers.length;
            } else if (Array.isArray(famRes.data)) {
              famCount = (famRes.data as any[]).length;
            }
          }
        } catch (e) {
          console.log('Family count error', e);
        }

        const spouseRaw = await AsyncStorage.getItem('@user_spouse_info');
        let spouseAdded = false;
        if (spouseRaw) {
          const sData = JSON.parse(spouseRaw);
          if (sData.spouseName) {
            spouseAdded = true;
            if (famCount === 0) famCount = 1;
          }
        }
        setFamilyCount(famCount);

        // 3. Friends Count
        let frCount = 0;
        try {
          const chatsRes = await apiClient.get('/chats');
          if (chatsRes.data?.data && Array.isArray(chatsRes.data.data)) {
            frCount = chatsRes.data.data.length;
          } else if (Array.isArray(chatsRes.data)) {
            frCount = chatsRes.data.length;
          }
        } catch (e) {
          console.log('Friends count error', e);
        }
        setFriendsCount(frCount);

        // 4. Upcoming Celebrations Count
        let evCount = 0;
        try {
          const celRes = await intelligenceApi.getUpcomingCelebrations();
          if (celRes.success && Array.isArray(celRes.data)) {
            evCount = celRes.data.length;
          }
        } catch (e) {
          console.log('Upcoming celebrations error', e);
        }
        if (spouseAdded) evCount += 2;
        setUpcomingCount(evCount);

        // 5. Recent Memories Count
        let memCount = 0;
        try {
          const vaultRes = await apiClient.get('/vault/list');
          if (vaultRes.data?.data?.content && Array.isArray(vaultRes.data.data.content)) {
            memCount = vaultRes.data.data.content.length;
          } else if (Array.isArray(vaultRes.data)) {
            memCount = vaultRes.data.length;
          }
        } catch (e) {
          console.log('Memories count error', e);
        }
        setMemoriesCount(memCount);

        // 6. Calculate Dynamic Relationship Score (0 - 100)
        let finalScore = 50;
        if (backendScore !== null && backendScore > 0) {
          finalScore = backendScore;
        } else {
          let calculated = 50; // base score
          calculated += Math.min(famCount * 5, 25); // family bonus (+25 max)
          calculated += Math.min(frCount * 2, 20); // friends bonus (+20 max)
          calculated += Math.min(evCount * 5, 15); // celebrations bonus (+15 max)
          calculated += Math.min(memCount * 2, 10); // memories bonus (+10 max)
          calculated -= Math.min(notWished * 5, 20); // penalty for not wished (-20 max)
          finalScore = Math.max(0, Math.min(100, Math.round(calculated)));
        }

        setRelationshipScore(finalScore);

        if (finalScore >= 80) setActivityTier('High');
        else if (finalScore >= 60) setActivityTier('Medium');
        else setActivityTier('Low');

      } catch (error) {
        console.log('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllMetrics();
  }, []);

  const getScoreRating = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const stats = [
    { label: 'Family Members', value: String(familyCount), icon: 'people', color: '#7E57C2' },
    { label: 'Friends', value: String(friendsCount), icon: 'person-add', color: '#FF8A65' },
    { label: 'Upcoming Celebrations', value: String(upcomingCount), icon: 'gift', color: '#FFCA28' },
    { label: 'People Not Wished', value: String(notWishedCount), icon: 'warning', color: '#EF5350' },
    { label: 'Recent Memories', value: String(memoriesCount), icon: 'images', color: '#29B6F6' },
    { label: 'Friend Activity', value: activityTier, icon: 'trending-up', color: '#66BB6A', isText: true },
  ];

  return (
    <LinearGradient colors={['#6366F1', '#A53FE7']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relationship Intelligence</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Relationship Score</Text>
            <View style={styles.donutRing}>
              <View style={styles.scoreInner}>
                <Text style={styles.scoreValue}>{relationshipScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            <Text style={styles.scoreSubtitle}>
              {getScoreRating(relationshipScore)}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" style={{ padding: 20 }} />
            ) : (
              stats.map((stat, index) => (
                <View key={index} style={[styles.statRow, index === stats.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.statLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                      <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                    </View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.statValue,
                      stat.isText && { color: stat.color, fontSize: 16 },
                    ]}
                  >
                    {stat.value}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  donutRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreMax: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 2,
  },
  scoreSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
});
