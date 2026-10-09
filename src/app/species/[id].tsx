import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReferenceAudioPlayer } from '@/components/ReferenceAudioPlayer';
import { speciesRepository } from '@/data/repositories/speciesRepository';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Species } from '@/shared/types';

export default function SpeciesDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (id) {
        const found = await speciesRepository.getById(id);
        setSpecies(found);
      }
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!species) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          Species information not found in local catalog.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}>
      {/* Header Profile */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.speciesIconCircle}>
          <Ionicons name="leaf" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.commonName, { color: theme.text }]}>
          {species.commonName}
        </Text>
        <Text style={[styles.scientificName, { color: theme.textSecondary }]}>
          {species.scientificName} • {species.family}
        </Text>
        <Text style={[styles.description, { color: theme.text }]}>
          {species.description}
        </Text>
      </View>

      {/* Reference Audio Player (FR-044, FR-045, FR-046) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Reference Bird Call
        </Text>
        <ReferenceAudioPlayer
          speciesName={species.commonName}
          callDescription={species.callDescription}
          attribution={species.contentSource}
          audioPath={species.referenceAudioPath}
        />
      </View>

      {/* Visual Identification Features (FR-042) */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.cardHeader}>
          <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Visual Features & Plumage
          </Text>
        </View>
        <Text style={[styles.cardBody, { color: theme.text }]}>
          {species.visualFeatures}
        </Text>
      </View>

      {/* Habitat Guidance (FR-043, FR-048) */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.cardHeader}>
          <Ionicons name="map-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Habitat & Typical Range
          </Text>
        </View>
        <Text style={[styles.cardBody, { color: theme.text }]}>
          {species.habitat}
        </Text>
        <View
          style={[
            styles.generalGuidancePill,
            { backgroundColor: theme.backgroundElement },
          ]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.guidanceText, { color: theme.textSecondary }]}>
            General ecological habitat guide, not a verified real-time GPS boundary.
          </Text>
        </View>
      </View>

      {/* Spotting Clues & Behavior (FR-043) */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.cardHeader}>
          <Ionicons name="compass-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Field Spotting Clues & Behavior
          </Text>
        </View>
        <Text style={[styles.cardBody, { color: theme.text }]}>
          {species.spottingHint}
        </Text>
      </View>

      {/* Content Attribution (FR-046, FR-074) */}
      <View style={styles.attributionContainer}>
        <Text style={[styles.attributionText, { color: theme.textSecondary }]}>
          Media Source & Attribution: {species.contentSource}
        </Text>
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
    padding: 32,
  },
  notFoundText: {
    fontSize: 15,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  speciesIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#AEEED3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  commonName: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  scientificName: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
    letterSpacing: -0.2,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  generalGuidancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  guidanceText: {
    fontSize: 11,
    flex: 1,
  },
  attributionContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  attributionText: {
    fontSize: 12,
  },
});
