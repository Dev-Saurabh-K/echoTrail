import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Observation, SightingStatus } from '@/shared/types';

interface ObservationCardProps {
  observation: Observation;
  onPress: () => void;
  onDelete?: () => void;
}

export function ObservationCard({
  observation,
  onPress,
  onDelete,
}: ObservationCardProps) {
  const theme = useTheme();
  const topCandidate = observation.candidates[0];
  const species = topCandidate?.species;

  const dateObj = new Date(observation.observedAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const getStatusBadge = (status: SightingStatus) => {
    switch (status) {
      case 'spotted':
        return {
          label: 'Visually Spotted',
          bg: '#AEEED3',
          color: '#164E47',
          icon: 'eye' as const,
        };
      case 'heard_not_seen':
        return {
          label: 'Heard Only',
          bg: '#E0F2EC',
          color: '#287A74',
          icon: 'volume-medium' as const,
        };
      case 'unconfirmed':
        return {
          label: 'Unconfirmed',
          bg: '#FFF8B0',
          color: '#665103',
          icon: 'help-circle' as const,
        };
    }
  };

  const statusBadge = getStatusBadge(observation.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <Ionicons name={statusBadge.icon} size={12} color={statusBadge.color} />
          <Text style={[styles.statusText, { color: statusBadge.color }]}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      <View style={styles.speciesRow}>
        <View style={styles.speciesIconBox}>
          <Ionicons name="leaf" size={20} color={theme.primary} />
        </View>
        <View style={styles.speciesTextCol}>
          <Text style={[styles.commonName, { color: theme.text }]}>
            {species?.commonName || topCandidate?.speciesId || 'Unknown Bird'}
          </Text>
          {species?.scientificName && (
            <Text style={[styles.scientificName, { color: theme.textSecondary }]}>
              {species.scientificName}
            </Text>
          )}
        </View>
        {topCandidate && (
          <View style={[styles.scoreBadge, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.scoreText, { color: theme.text }]}>
              {Math.round(topCandidate.score * 100)}%
            </Text>
          </View>
        )}
      </View>

      {observation.notes ? (
        <Text
          numberOfLines={2}
          style={[styles.notesText, { color: theme.textSecondary }]}>
          &ldquo;{observation.notes}&rdquo;
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        {observation.audioPath ? (
          <View style={[styles.audioTag, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="mic-outline" size={12} color={theme.primary} />
            <Text style={[styles.audioTagText, { color: theme.primary }]}>
              Audio Retained
            </Text>
          </View>
        ) : (
          <View />
        )}

        {observation.candidates.length > 1 && (
          <Text style={[styles.candidatesCount, { color: theme.textSecondary }]}>
            +{observation.candidates.length - 1} other candidates
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speciesIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#AEEED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesTextCol: {
    flex: 1,
  },
  commonName: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scientificName: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontStyle: 'italic',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  notesText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  audioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  audioTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  candidatesCount: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});
