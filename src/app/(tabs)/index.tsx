import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CURRENT_MODEL_VERSION, getDatabase } from '@/core/database';
import { PRELOADED_SAMPLES } from '@/data/samples';
import { observationRepository } from '@/data/repositories/observationRepository';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AudioSampleItem, Observation } from '@/shared/types';

export default function ExploreScreen() {
  const theme = useTheme();
  const [recentObservations, setRecentObservations] = useState<Observation[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getDatabase();
        if (mounted) {
          const obs = await observationRepository.list(3);
          setRecentObservations(obs);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartRecording = () => {
    router.push('/record');
  };

  const handleTestSample = (sample: AudioSampleItem) => {
    router.push({
      pathname: '/results',
      params: {
        sampleId: sample.id,
        speciesHint: sample.speciesId,
        noiseLevel: sample.simulatedNoiseLevel || 'low',
        durationMs: (sample.durationSeconds * 1000).toString(),
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}>
      {/* Offline Status & Model Banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <View style={styles.statusIndicatorRow}>
          <View style={styles.onlineDot} />
          <Text style={[styles.statusTitle, { color: theme.text }]}>
            Offline Ready • Private On-Device AI
          </Text>
        </View>
        <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
          {CURRENT_MODEL_VERSION.name} {CURRENT_MODEL_VERSION.version} • No network required
        </Text>
      </View>

      {/* Hero Action Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.primary,
          },
        ]}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={14} color="#FFF8B0" />
          <Text style={styles.heroBadgeText}>AI Audio Identifier</Text>
        </View>

        <Text style={styles.heroTitle}>Hear a bird nearby?</Text>
        <Text style={styles.heroDescription}>
          Record 5 to 10 seconds of birdsong to identify candidate species and learn practical spotting clues.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.recordButton,
            pressed && styles.recordButtonPressed,
          ]}
          onPress={handleStartRecording}>
          <View style={styles.micIconCircle}>
            <Ionicons name="mic" size={24} color={theme.primary} />
          </View>
          <View style={styles.recordButtonTextCol}>
            <Text style={styles.recordButtonMainText}>Start Recording</Text>
            <Text style={styles.recordButtonSubText}>Target 5–10s audio clip</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.primary} />
        </Pressable>
      </View>

      {/* Core Journey Explanation */}
      <View style={[styles.journeyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          How EchoTrail Works
        </Text>
        <View style={styles.stepList}>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.stepNumberText, { color: theme.primary }]}>1</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={[styles.stepHeading, { color: theme.text }]}>Listen & Record</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Hold your device toward the bird for 5–10 seconds.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.stepNumberText, { color: theme.primary }]}>2</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={[styles.stepHeading, { color: theme.text }]}>On-Device Identification</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Local AI calculates ranked species with confidence scores.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.stepNumberText, { color: theme.primary }]}>3</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={[styles.stepHeading, { color: theme.text }]}>Compare & Spot</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Play reference calls and follow visual clues to spot the bird.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.stepNumberText, { color: theme.primary }]}>4</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={[styles.stepHeading, { color: theme.text }]}>Log in Journal</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Mark if visually spotted or heard only to earn challenge points.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Preloaded Demo Recordings (FR-005, UC-02) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithIcon}>
          <Ionicons name="musical-notes" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Bundled Demo Recordings
          </Text>
        </View>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
          Test offline without outdoor birds
        </Text>
      </View>

      <View style={styles.samplesGrid}>
        {PRELOADED_SAMPLES.map((sample) => {
          const isAmbiguous = sample.simulatedNoiseLevel === 'high';
          const isSilent = sample.simulatedNoiseLevel === 'silent';

          return (
            <Pressable
              key={sample.id}
              style={({ pressed }) => [
                styles.sampleCard,
                {
                  backgroundColor: theme.card,
                  borderColor: isAmbiguous
                    ? '#FDE68A'
                    : isSilent
                    ? '#FECACA'
                    : theme.border,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => handleTestSample(sample)}>
              <View style={styles.sampleTopRow}>
                <View
                  style={[
                    styles.sampleIconBox,
                    {
                      backgroundColor: isAmbiguous
                        ? '#FEF3C7'
                        : isSilent
                        ? '#FEE2E2'
                        : '#DCFCE7',
                    },
                  ]}>
                  <Ionicons
                    name={
                      isAmbiguous
                        ? 'warning-outline'
                        : isSilent
                        ? 'volume-mute-outline'
                        : 'play'
                    }
                    size={16}
                    color={
                      isAmbiguous
                        ? '#B45309'
                        : isSilent
                        ? '#DC2626'
                        : '#15803D'
                    }
                  />
                </View>
                <View style={styles.sampleDurationBadge}>
                  <Text style={styles.sampleDurationText}>
                    {sample.durationSeconds}s
                  </Text>
                </View>
              </View>

              <Text style={[styles.sampleTitle, { color: theme.text }]}>
                {sample.title}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.sampleDesc, { color: theme.textSecondary }]}>
                {sample.description}
              </Text>

              <View style={styles.sampleFooterRow}>
                <Text style={[styles.testPrompt, { color: theme.primary }]}>
                  Identify clip &rarr;
                </Text>
                {isAmbiguous && (
                  <Text style={styles.tagAmbiguous}>Tests Uncertainty</Text>
                )}
                {isSilent && (
                  <Text style={styles.tagSilent}>Tests Silence Check</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Recent Discoveries */}
      {recentObservations.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Field Discoveries
              </Text>
            </View>
            <Pressable onPress={() => router.push('/journal')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                View Journal &rarr;
              </Text>
            </Pressable>
          </View>

          {recentObservations.map((obs) => {
            const top = obs.candidates[0];
            return (
              <Pressable
                key={obs.observationId}
                style={[
                  styles.recentItem,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/journal/[id]',
                    params: { id: obs.observationId },
                  })
                }>
                <View style={styles.recentIconBox}>
                  <Ionicons name="leaf" size={16} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentName, { color: theme.text }]}>
                    {top?.species?.commonName || top?.speciesId || 'Bird Observation'}
                  </Text>
                  <Text style={[styles.recentDate, { color: theme.textSecondary }]}>
                    {new Date(obs.observedAt).toLocaleDateString()} • {obs.status.replace('_', ' ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  statusBanner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#287A74',
  },
  statusTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  statusSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 248, 176, 0.22)',
    borderColor: 'rgba(255, 248, 176, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    fontFamily: Fonts.sans,
    color: '#FFF8B0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    marginTop: 6,
  },
  recordButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  micIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#AEEED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonTextCol: {
    flex: 1,
  },
  recordButtonMainText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#287A74',
    letterSpacing: -0.2,
  },
  recordButtonSubText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#4A6963',
  },
  journeyCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  stepList: {
    gap: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepTextCol: {
    flex: 1,
    gap: 2,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHint: {
    fontSize: 12,
  },
  samplesGrid: {
    gap: 12,
  },
  sampleCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  sampleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleDurationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sampleDurationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  sampleTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sampleDesc: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  sampleFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  testPrompt: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  tagAmbiguous: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: '#705803',
    backgroundColor: '#FFF8B0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '700',
  },
  tagSilent: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '600',
  },
  recentSection: {
    gap: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  recentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentDate: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});
