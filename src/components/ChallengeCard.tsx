import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ChallengeWithProgress } from '@/shared/types';

interface ChallengeCardProps {
  challenge: ChallengeWithProgress;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const theme = useTheme();

  const getIconName = (name: string): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case 'mic':
        return 'mic';
      case 'eye':
        return 'eye';
      case 'leaf':
        return 'leaf';
      case 'tree':
        return 'bonfire-outline';
      case 'book':
        return 'book';
      case 'sun':
        return 'sunny';
      default:
        return 'trophy';
    }
  };

  const progressPercent = Math.min(
    Math.round((challenge.currentValue / challenge.targetCount) * 100),
    100
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: challenge.isCompleted ? theme.primary : theme.border,
          borderWidth: challenge.isCompleted ? 1.5 : 1,
        },
      ]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: challenge.isCompleted ? '#DCFCE7' : theme.backgroundElement,
            },
          ]}>
          <Ionicons
            name={getIconName(challenge.iconName)}
            size={22}
            color={challenge.isCompleted ? '#15803D' : theme.primary}
          />
        </View>

        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: theme.text }]}>
            {challenge.title}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {challenge.description}
          </Text>
        </View>

        <View
          style={[
            styles.pointsBadge,
            {
              backgroundColor: challenge.isCompleted ? '#FEF3C7' : theme.backgroundElement,
            },
          ]}>
          <Ionicons
            name="trophy"
            size={12}
            color={challenge.isCompleted ? '#B45309' : theme.accent}
          />
          <Text
            style={[
              styles.pointsText,
              { color: challenge.isCompleted ? '#B45309' : theme.text },
            ]}>
            +{challenge.points}
          </Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            Progress: {challenge.currentValue} / {challenge.targetCount}
          </Text>
          {challenge.isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#15803D" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <Text style={[styles.percentText, { color: theme.textSecondary }]}>
              {progressPercent}%
            </Text>
          )}
        </View>

        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: challenge.isCompleted ? '#10B981' : theme.primary,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressSection: {
    gap: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
