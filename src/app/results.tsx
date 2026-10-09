import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CandidateCard } from '@/components/CandidateCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ReferenceAudioPlayer } from '@/components/ReferenceAudioPlayer';
import { birdClassifier } from '@/core/classifier';
import { CURRENT_MODEL_VERSION } from '@/core/database';
import { EchoTrailError, EchoTrailErrorCode } from '@/core/errors';
import { privacyManager } from '@/core/privacy';
import { challengeRepository } from '@/data/repositories/challengeRepository';
import { observationRepository } from '@/data/repositories/observationRepository';
import { speciesRepository } from '@/data/repositories/speciesRepository';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  AudioInput,
  BirdPrediction,
  NewObservation,
  SightingStatus,
  Species,
} from '@/shared/types';

export default function ResultsScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    recordedUri?: string;
    sampleId?: string;
    speciesHint?: string;
    noiseLevel?: 'low' | 'moderate' | 'high' | 'silent';
    durationMs?: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<BirdPrediction[]>([]);
  const [speciesMap, setSpeciesMap] = useState<Record<string, Species>>({});
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Journal saving state
  const [sightingStatus, setSightingStatus] = useState<SightingStatus>('heard_not_seen');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unlockedChallengeTitle, setUnlockedChallengeTitle] = useState<string | null>(null);

  // Error state
  const [errorCode, setErrorCode] = useState<EchoTrailErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runInference = React.useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);

    const duration = params.durationMs ? parseInt(params.durationMs, 10) : 6000;
    const uri = params.recordedUri || `sample://${params.sampleId || 'default'}`;

    const audioInput: AudioInput = {
      uri,
      sampleRate: 16000,
      channels: 1,
      durationMs: duration,
      simulatedNoiseLevel: params.noiseLevel || 'low',
      targetSpeciesHint: params.speciesHint,
    };

    try {
      const preds = await birdClassifier.classify(audioInput);
      setCandidates(preds);
      if (preds.length > 0) {
        setSelectedCandidateId(preds[0].speciesId);
      }

      // Pre-load species metadata for candidates
      const sMap: Record<string, Species> = {};
      for (const p of preds) {
        const s = await speciesRepository.getById(p.speciesId);
        if (s) sMap[p.speciesId] = s;
      }
      setSpeciesMap(sMap);
    } catch (err: any) {
      if (err instanceof EchoTrailError) {
        setErrorCode(err.code);
        setErrorMessage(err.message);
      } else {
        setErrorCode('INFERENCE_FAILED');
        setErrorMessage(err.message || 'Error executing audio inference.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    params.durationMs,
    params.noiseLevel,
    params.recordedUri,
    params.sampleId,
    params.speciesHint,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runInference();
    }, 0);
    return () => clearTimeout(timeout);
  }, [runInference]);

  const handleSaveObservation = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);

    try {
      const settings = privacyManager.getSettings();
      const newObs: NewObservation = {
        observedAt: new Date().toISOString(),
        status: sightingStatus,
        notes: notes.trim() || undefined,
        audioPath: settings.retainAudioWithObservations ? params.recordedUri || null : null,
        modelVersionId: CURRENT_MODEL_VERSION.modelVersionId,
        candidates: candidates.map((c) => ({
          speciesId: c.speciesId,
          rank: c.rank,
          score: c.score,
          scoreType: c.scoreType,
        })),
      };

      await observationRepository.save(newObs);
      setIsSaved(true);

      // Evaluate challenge engine immediately (FR-062)
      const allObs = await observationRepository.list(200);
      const { newlyCompleted } = await challengeRepository.evaluateAllChallenges(allObs);
      if (newlyCompleted.length > 0) {
        setUnlockedChallengeTitle(newlyCompleted[0].title);
      }
    } catch (err: any) {
      alert('Failed to save observation: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const topPrediction = candidates[0];
  const selectedSpecies = selectedCandidateId ? speciesMap[selectedCandidateId] : null;
  const isAmbiguous = topPrediction?.confidenceLabel === 'uncertain';

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingTitle, { color: theme.text }]}>
          Identifying Vocalizations...
        </Text>
        <Text style={[styles.loadingSubtitle, { color: theme.textSecondary }]}>
          Filtering ambient noise and matching against acoustic call database
        </Text>
      </View>
    );
  }

  if (errorCode) {
    return (
      <View style={[styles.errorScreen, { backgroundColor: theme.background }]}>
        <ErrorAlert
          code={errorCode}
          customMessage={errorMessage || undefined}
          onRetry={runInference}
          onUseSample={() => router.replace('/')}
          onDismiss={() => router.replace('/')}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}>
      {/* Uncertainty Messaging (FR-034, UC-02) */}
      {isAmbiguous ? (
        <View style={styles.uncertaintyBanner}>
          <Ionicons name="warning" size={20} color="#6B5404" />
          <View style={{ flex: 1 }}>
            <Text style={styles.uncertaintyTitle}>Ambiguous Recording Notice</Text>
            <Text style={styles.uncertaintyText}>
              Acoustic scores are tentative due to wind buffeting or distance. Listen to the reference calls below to confirm distinctive song patterns.
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.modelNotice,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <Ionicons name="sparkles" size={16} color={theme.primary} />
          <Text style={[styles.modelNoticeText, { color: theme.textSecondary }]}>
            AI suggestion based on {CURRENT_MODEL_VERSION.name}. Compare reference audio to confirm.
          </Text>
        </View>
      )}

      {/* Candidate Species List (FR-031, FR-032) */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Ranked Candidate Species
        </Text>

        <View style={styles.candidatesList}>
          {candidates.map((pred) => (
            <CandidateCard
              key={pred.speciesId}
              prediction={pred}
              species={speciesMap[pred.speciesId]}
              isSelected={selectedCandidateId === pred.speciesId}
              onSelect={() => setSelectedCandidateId(pred.speciesId)}
              onViewGuide={() =>
                router.push({
                  pathname: '/species/[id]',
                  params: { id: pred.speciesId },
                })
              }
            />
          ))}
        </View>
      </View>

      {/* Reference Audio Player for Selected Species (FR-044, FR-045) */}
      {selectedSpecies && (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            Acoustic Comparison
          </Text>
          <ReferenceAudioPlayer
            speciesName={selectedSpecies.commonName}
            callDescription={selectedSpecies.callDescription}
            attribution={selectedSpecies.contentSource}
            audioPath={selectedSpecies.referenceAudioPath}
          />
        </View>
      )}

      {/* Spotting Clues & Identification Guidance (FR-043) */}
      {selectedSpecies && (
        <View
          style={[
            styles.cluesCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <View style={styles.cluesHeader}>
            <Ionicons name="eye-outline" size={20} color={theme.primary} />
            <Text style={[styles.cluesTitle, { color: theme.text }]}>
              Field Spotting Guide: {selectedSpecies.commonName}
            </Text>
          </View>

          <View style={styles.clueRow}>
            <Text style={[styles.clueLabel, { color: theme.textSecondary }]}>Habitat:</Text>
            <Text style={[styles.clueValue, { color: theme.text }]}>
              {selectedSpecies.habitat}
            </Text>
          </View>

          <View style={styles.clueRow}>
            <Text style={[styles.clueLabel, { color: theme.textSecondary }]}>Visual Clues:</Text>
            <Text style={[styles.clueValue, { color: theme.text }]}>
              {selectedSpecies.visualFeatures}
            </Text>
          </View>

          <View style={styles.clueRow}>
            <Text style={[styles.clueLabel, { color: theme.textSecondary }]}>Where to look:</Text>
            <Text style={[styles.clueValue, { color: theme.text }]}>
              {selectedSpecies.spottingHint}
            </Text>
          </View>
        </View>
      )}

      {/* Sighting Status & Save to Journal (FR-038, FR-050, FR-054) */}
      <View
        style={[
          styles.saveSection,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Text style={[styles.saveSectionTitle, { color: theme.text }]}>
          Log Observation in Field Journal
        </Text>
        <Text style={[styles.saveSectionSubtitle, { color: theme.textSecondary }]}>
          Did you spot the bird with your eyes, or identify it by sound only?
        </Text>

        {/* Status Selector */}
        <View style={styles.statusButtonsRow}>
          <Pressable
            style={[
              styles.statusOption,
              sightingStatus === 'spotted' && {
                backgroundColor: '#AEEED3',
                borderColor: '#287A74',
              },
            ]}
            onPress={() => setSightingStatus('spotted')}>
            <Ionicons
              name="eye"
              size={18}
              color={sightingStatus === 'spotted' ? '#164E47' : theme.textSecondary}
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: sightingStatus === 'spotted' ? '#164E47' : theme.text },
              ]}>
              Visually Spotted
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusOption,
              sightingStatus === 'heard_not_seen' && {
                backgroundColor: '#E0F2EC',
                borderColor: '#287A74',
              },
            ]}
            onPress={() => setSightingStatus('heard_not_seen')}>
            <Ionicons
              name="volume-medium"
              size={18}
              color={
                sightingStatus === 'heard_not_seen' ? '#287A74' : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: sightingStatus === 'heard_not_seen' ? '#287A74' : theme.text },
              ]}>
              Heard Only
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusOption,
              sightingStatus === 'unconfirmed' && {
                backgroundColor: '#FFF8B0',
                borderColor: '#876D04',
              },
            ]}
            onPress={() => setSightingStatus('unconfirmed')}>
            <Ionicons
              name="help-circle"
              size={18}
              color={
                sightingStatus === 'unconfirmed' ? '#665103' : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: sightingStatus === 'unconfirmed' ? '#665103' : theme.text },
              ]}>
              Uncertain
            </Text>
          </Pressable>
        </View>

        {/* Optional Notes (FR-053) */}
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="Add optional notes (e.g. perch location, weather, flock size)..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Unlocked Challenge Alert */}
        {unlockedChallengeTitle && (
          <View style={styles.challengeAlert}>
            <Ionicons name="trophy" size={20} color="#6B5404" />
            <Text style={styles.challengeAlertText}>
              Challenge Unlocked: &ldquo;{unlockedChallengeTitle}&rdquo;!
            </Text>
          </View>
        )}

        {/* Save Button */}
        {isSaved ? (
          <View style={styles.savedSuccessBox}>
            <Ionicons name="checkmark-circle" size={20} color="#287A74" />
            <Text style={styles.savedSuccessText}>Saved to Field Journal!</Text>
            <Pressable
              style={styles.viewJournalButton}
              onPress={() => router.push('/journal')}>
              <Text style={styles.viewJournalButtonText}>View in Journal &rarr;</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.85 },
            ]}
            disabled={isSaving}
            onPress={handleSaveObservation}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save to Journal</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  errorScreen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  uncertaintyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8B0',
    borderWidth: 1,
    borderColor: '#E5DE8A',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  uncertaintyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#544102',
    letterSpacing: -0.2,
  },
  uncertaintyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: '#473602',
    marginTop: 2,
  },
  modelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  modelNoticeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  candidatesList: {
    gap: 10,
  },
  cluesCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cluesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cluesTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  clueRow: {
    gap: 2,
  },
  clueLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  clueValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  saveSection: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  saveSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveSectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusOptionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  notesInput: {
    fontFamily: Fonts.sans,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  challengeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8B0',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  challengeAlertText: {
    fontFamily: Fonts.sans,
    color: '#544102',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveButtonText: {
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  savedSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#AEEED3',
    padding: 14,
    borderRadius: 14,
  },
  savedSuccessText: {
    fontFamily: Fonts.sans,
    color: '#164E47',
    fontSize: 14,
    fontWeight: '700',
  },
  viewJournalButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewJournalButtonText: {
    fontFamily: Fonts.sans,
    color: '#287A74',
    fontSize: 13,
    fontWeight: '700',
  },
});
