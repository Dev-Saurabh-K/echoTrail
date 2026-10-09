import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ObservationCard } from '@/components/ObservationCard';
import { observationRepository } from '@/data/repositories/observationRepository';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Observation, SightingStatus } from '@/shared/types';

type FilterType = 'all' | SightingStatus;

export default function JournalScreen() {
  const theme = useTheme();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadObservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await observationRepository.list(200);
      setObservations(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadObservations();
    }, [loadObservations])
  );

  const filteredObservations = observations.filter((obs) => {
    if (activeFilter !== 'all' && obs.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const topName = obs.candidates[0]?.species?.commonName?.toLowerCase() || '';
      const notes = obs.notes?.toLowerCase() || '';
      return topName.includes(q) || notes.includes(q);
    }
    return true;
  });

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: `All (${observations.length})` },
    {
      id: 'spotted',
      label: `Spotted (${observations.filter((o) => o.status === 'spotted').length})`,
    },
    {
      id: 'heard_not_seen',
      label: `Heard Only (${observations.filter((o) => o.status === 'heard_not_seen').length})`,
    },
    {
      id: 'unconfirmed',
      label: `Unconfirmed (${observations.filter((o) => o.status === 'unconfirmed').length})`,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by species name or notes..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterScroll}>
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected
                    ? theme.primary
                    : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setActiveFilter(tab.id)}>
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : theme.text },
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Observations List */}
      <FlatList
        data={filteredObservations}
        keyExtractor={(item) => item.observationId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ObservationCard
            observation={item}
            onPress={() =>
              router.push({
                pathname: '/journal/[id]',
                params: { id: item.observationId },
              })
            }
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.backgroundElement }]}>
                <Ionicons name="leaf-outline" size={36} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Observations Recorded
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                {searchQuery || activeFilter !== 'all'
                  ? 'No journal entries match your search or filter.'
                  : 'Start by recording birdsong on the Explore screen or trying one of the bundled demo bird calls.'}
              </Text>
              <Pressable
                style={[styles.startRecordButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/')}>
                <Ionicons name="mic" size={18} color="#FFFFFF" />
                <Text style={styles.startRecordButtonText}>Explore & Identify</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    fontFamily: Fonts.sans,
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#AEEED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyDescription: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  startRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 8,
  },
  startRecordButtonText: {
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
