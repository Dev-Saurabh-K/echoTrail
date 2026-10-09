import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConfidenceBadge } from './ConfidenceBadge';
import { useTheme } from '@/hooks/use-theme';
import { BirdPrediction, Species } from '@/shared/types';

interface CandidateCardProps {
  prediction: BirdPrediction;
  species?: Species;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewGuide?: () => void;
}

export function CandidateCard({
  prediction,
  species,
  isSelected,
  onSelect,
  onViewGuide,
}: CandidateCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isSelected ? theme.primary : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}
      onPress={onSelect}>
      <View style={styles.topRow}>
        <View style={styles.rankContainer}>
          <View
            style={[
              styles.rankBadge,
              { backgroundColor: prediction.rank === 1 ? theme.primary : theme.backgroundElement },
            ]}>
            <Text
              style={[
                styles.rankText,
                { color: prediction.rank === 1 ? '#FFFFFF' : theme.text },
              ]}>
              #{prediction.rank}
            </Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={[styles.commonName, { color: theme.text }]}>
              {species ? species.commonName : prediction.speciesId}
            </Text>
            {species && (
              <Text style={[styles.scientificName, { color: theme.textSecondary }]}>
                {species.scientificName}
              </Text>
            )}
          </View>
        </View>

        <ConfidenceBadge
          confidence={prediction.confidenceLabel}
          score={prediction.score}
        />
      </View>

      <Text style={[styles.explanation, { color: theme.textSecondary }]}>
        {prediction.explanation}
      </Text>

      {species && (
        <View style={[styles.hintBox, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="compass-outline" size={14} color={theme.primary} />
          <Text
            numberOfLines={2}
            style={[styles.hintText, { color: theme.text }]}>
            <Text style={{ fontWeight: '700' }}>Where to spot: </Text>
            {species.spottingHint}
          </Text>
        </View>
      )}

      {onViewGuide && (
        <Pressable
          style={({ pressed }) => [
            styles.guideLink,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onViewGuide}>
          <Text style={[styles.guideLinkText, { color: theme.primary }]}>
            View full spotting clues & reference audio
          </Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
  },
  titleCol: {
    flex: 1,
  },
  commonName: {
    fontSize: 16,
    fontWeight: '700',
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 13,
    lineHeight: 18,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  guideLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
