import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AudioWaveform } from '@/components/AudioWaveform';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { observationRepository } from '@/data/repositories/observationRepository';
import { useTheme } from '@/hooks/use-theme';
import { Observation, SightingStatus } from '@/shared/types';

export default function ObservationDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit fields
  const [status, setStatus] = useState<SightingStatus>('unconfirmed');
  const [notes, setNotes] = useState('');
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Audio simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    (async () => {
      if (id) {
        const obs = await observationRepository.getById(id);
        if (obs) {
          setObservation(obs);
          setStatus(obs.status);
          setNotes(obs.notes || '');
        }
      }
      setIsLoading(false);
    })();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!observation) return;
    try {
      await observationRepository.update(observation.observationId, {
        status,
        notes: notes.trim() || null,
      });
      setIsSavedBanner(true);
      setTimeout(() => setIsSavedBanner(false), 3000);
    } catch (err: any) {
      alert('Error updating observation: ' + err.message);
    }
  };

  const handleDelete = () => {
    const doDelete = async () => {
      if (!observation) return;
      try {
        await observationRepository.delete(observation.observationId);
        router.back();
      } catch (err: any) {
        alert('Error deleting observation: ' + err.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Delete this observation and any retained audio recording?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Observation',
        'Are you sure you want to permanently delete this observation and its associated local audio?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const toggleAudioPlay = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!observation) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          Observation not found.
        </Text>
      </View>
    );
  }

  const topCandidate = observation.candidates[0];
  const dateObj = new Date(observation.observedAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}>
      {isSavedBanner && (
        <View style={styles.savedBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#15803D" />
          <Text style={styles.savedBannerText}>Changes saved successfully!</Text>
        </View>
      )}

      {/* Header Info Card */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.commonName, { color: theme.text }]}>
              {topCandidate?.species?.commonName || topCandidate?.speciesId || 'Bird Observation'}
            </Text>
            {topCandidate?.species?.scientificName && (
              <Text style={[styles.scientificName, { color: theme.textSecondary }]}>
                {topCandidate.species.scientificName}
              </Text>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
            onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>

        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
            {formattedDate} at {formattedTime}
          </Text>
        </View>

        <Text style={[styles.modelRefText, { color: theme.textSecondary }]}>
          Classified using {observation.modelVersionId}
        </Text>
      </View>

      {/* Retained Audio Recording (FR-057) */}
      {observation.audioPath && (
        <View
          style={[
            styles.audioCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <View style={styles.audioCardHeader}>
            <Ionicons name="mic" size={18} color={theme.primary} />
            <Text style={[styles.audioCardTitle, { color: theme.text }]}>
              Retained Field Audio Recording
            </Text>
          </View>

          <AudioWaveform isActive={isPlayingAudio} barCount={20} height={32} />

          <Pressable
            style={({ pressed }) => [
              styles.playAudioButton,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.85 },
            ]}
            onPress={toggleAudioPlay}>
            <Ionicons
              name={isPlayingAudio ? 'pause' : 'play'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.playAudioButtonText}>
              {isPlayingAudio ? 'Pause Audio' : 'Play Original Field Audio'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Sighting Status Update (FR-054) */}
      <View
        style={[
          styles.editSection,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Update Sighting Status
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Spotted this bird after hearing it? Update to earn bonus challenge progress!
        </Text>

        <View style={styles.statusButtonsRow}>
          <Pressable
            style={[
              styles.statusOption,
              status === 'spotted' && {
                backgroundColor: '#DCFCE7',
                borderColor: '#15803D',
              },
            ]}
            onPress={() => setStatus('spotted')}>
            <Ionicons
              name="eye"
              size={16}
              color={status === 'spotted' ? '#15803D' : theme.textSecondary}
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: status === 'spotted' ? '#15803D' : theme.text },
              ]}>
              Spotted
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusOption,
              status === 'heard_not_seen' && {
                backgroundColor: '#DBEAFE',
                borderColor: '#1D4ED8',
              },
            ]}
            onPress={() => setStatus('heard_not_seen')}>
            <Ionicons
              name="volume-medium"
              size={16}
              color={status === 'heard_not_seen' ? '#1D4ED8' : theme.textSecondary}
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: status === 'heard_not_seen' ? '#1D4ED8' : theme.text },
              ]}>
              Heard Only
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusOption,
              status === 'unconfirmed' && {
                backgroundColor: '#FEF3C7',
                borderColor: '#B45309',
              },
            ]}
            onPress={() => setStatus('unconfirmed')}>
            <Ionicons
              name="help-circle"
              size={16}
              color={status === 'unconfirmed' ? '#B45309' : theme.textSecondary}
            />
            <Text
              style={[
                styles.statusOptionLabel,
                { color: status === 'unconfirmed' ? '#B45309' : theme.text },
              ]}>
              Unconfirmed
            </Text>
          </Pressable>
        </View>

        {/* Field Notes Input */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>
          Field Notes
        </Text>
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="Add notes about behavior, tree height, weather, or location..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable
          style={({ pressed }) => [
            styles.saveChangesButton,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleSaveChanges}>
          <Text style={styles.saveChangesButtonText}>Save Changes</Text>
        </Pressable>
      </View>

      {/* Candidate Species Preserved (FR-052) */}
      <View style={styles.candidatesSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recorded AI Candidates
        </Text>
        {observation.candidates.map((c) => (
          <View
            key={c.candidateId}
            style={[
              styles.candidateRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <Text style={[styles.candidateRank, { color: theme.primary }]}>
              #{c.rank}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.candidateCommon, { color: theme.text }]}>
                {c.species?.commonName || c.speciesId}
              </Text>
              {c.species?.scientificName && (
                <Text
                  style={[styles.candidateScientific, { color: theme.textSecondary }]}>
                  {c.species.scientificName}
                </Text>
              )}
            </View>
            <ConfidenceBadge
              confidence={
                c.score >= 0.75 ? 'high' : c.score >= 0.5 ? 'moderate' : 'low'
              }
              score={c.score}
            />
          </View>
        ))}
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
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  savedBannerText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  headerCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  commonName: {
    fontSize: 22,
    fontWeight: '800',
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 6,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 13,
  },
  modelRefText: {
    fontSize: 11,
  },
  audioCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  audioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  audioCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  playAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAudioButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  editSection: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  statusOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveChangesButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  saveChangesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  candidatesSection: {
    gap: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  candidateRank: {
    fontSize: 14,
    fontWeight: '800',
    width: 24,
  },
  candidateCommon: {
    fontSize: 14,
    fontWeight: '700',
  },
  candidateScientific: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
