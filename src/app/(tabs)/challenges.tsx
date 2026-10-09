import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChallengeCard } from '@/components/ChallengeCard';
import { challengeRepository } from '@/data/repositories/challengeRepository';
import { observationRepository } from '@/data/repositories/observationRepository';
import { useTheme } from '@/hooks/use-theme';
import { ChallengeWithProgress } from '@/shared/types';

export default function ChallengesScreen() {
  const theme = useTheme();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const loadChallenges = useCallback(async () => {
    try {
      // Re-evaluate challenges against current observations to ensure fresh state
      const observations = await observationRepository.list(200);
      await challengeRepository.evaluateAllChallenges(observations);

      const list = await challengeRepository.listWithProgress();
      setChallenges(list);

      const points = await challengeRepository.getTotalPoints();
      setTotalPoints(points);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );

  const getExplorerRank = (points: number): { title: string; desc: string } => {
    if (points >= 700) {
      return {
        title: 'Master Naturalist',
        desc: 'Exceptional birding instincts and diligent field logging!',
      };
    }
    if (points >= 400) {
      return {
        title: 'Trail Scout',
        desc: 'Keen listener and observant wildlife tracker.',
      };
    }
    if (points >= 100) {
      return {
        title: 'Field Explorer',
        desc: 'Actively tuning into birdsong and recording observations.',
      };
    }
    return {
      title: 'Apprentice Listener',
      desc: 'Beginning your journey into the world of birdsong.',
    };
  };

  const rank = getExplorerRank(totalPoints);
  const completedCount = challenges.filter((c) => c.isCompleted).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Points & Rank Banner */}
      <View style={styles.headerBannerContainer}>
        <View style={[styles.rankCard, { backgroundColor: theme.primary }]}>
          <View style={styles.rankTopRow}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={26} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankSubtitle}>Explorer Rank</Text>
              <Text style={styles.rankTitle}>{rank.title}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsNumber}>{totalPoints}</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
            </View>
          </View>
          <Text style={styles.rankDescription}>{rank.desc}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {completedCount} / {challenges.length}
              </Text>
              <Text style={styles.statLabel}>Challenges Completed</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Challenges List */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.challengeId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ChallengeCard challenge={item} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Active Objectives
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Qualifying recordings and sightings automatically advance your progress.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBannerContainer: {
    padding: 16,
    paddingBottom: 4,
  },
  rankCard: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  rankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rankTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  pointsBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  pointsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
  rankDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  listHeader: {
    paddingBottom: 12,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
});
