import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { CURRENT_MODEL_VERSION } from '@/core/database';
import { privacyManager, PrivacySettings } from '@/core/privacy';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<PrivacySettings>(() => privacyManager.getSettings());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleToggleRetainAudio = (value: boolean) => {
    const updated = privacyManager.updateSettings({ retainAudioWithObservations: value });
    setSettings(updated);
  };

  const handleToggleLocation = (value: boolean) => {
    const updated = privacyManager.updateSettings({ locationTaggingEnabled: value });
    setSettings(updated);
  };

  const handleDeleteAllRecordings = () => {
    const runDelete = async () => {
      try {
        const count = await privacyManager.deleteAllRecordings();
        setActionMessage(`Cleared ${count} saved audio recording file(s).`);
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        setActionMessage('Error deleting recordings: ' + err.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Delete all saved audio recording files? Observation metadata will be preserved.')) {
        runDelete();
      }
    } else {
      Alert.alert(
        'Delete All Recordings',
        'Are you sure you want to delete all saved audio files? Your journal observations and species tags will remain safe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Audio', style: 'destructive', onPress: runDelete },
        ]
      );
    }
  };

  const handleResetAllData = () => {
    const runReset = async () => {
      try {
        await privacyManager.resetAllApplicationData();
        setActionMessage('All observations, audio, and challenge progress have been reset.');
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        setActionMessage('Error resetting data: ' + err.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Reset all application data? All observations and progress will be permanently deleted.')) {
        runReset();
      }
    } else {
      Alert.alert(
        'Reset All Data',
        'This will permanently delete all saved observations, retained audio recordings, and reset challenge progress. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset Everything', style: 'destructive', onPress: runReset },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}>
      {actionMessage && (
        <View style={styles.actionBanner}>
          <Ionicons name="information-circle" size={18} color="#287A74" />
          <Text style={styles.actionBannerText}>{actionMessage}</Text>
        </View>
      )}

      {/* Privacy Pledge Banner */}
      <View
        style={[
          styles.pledgeCard,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <View style={styles.pledgeHeader}>
          <Ionicons name="shield-checkmark" size={22} color={theme.primary} />
          <Text style={[styles.pledgeTitle, { color: theme.text }]}>
            Local-First Privacy Guarantee
          </Text>
        </View>
        <Text style={[styles.pledgeText, { color: theme.textSecondary }]}>
          EchoTrail processes all audio on your device. Audio recordings, GPS coordinates, and observation notes are NEVER uploaded to any server or cloud database.
        </Text>
      </View>

      {/* Privacy & Storage Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Privacy & Audio Retention
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Retain Audio with Observations
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Save the recorded audio clip alongside journal entries for later playback.
              </Text>
            </View>
            <Switch
              value={settings.retainAudioWithObservations}
              onValueChange={handleToggleRetainAudio}
              trackColor={{ false: '#D1D5DB', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Optional Location Tagging
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Attach coarse coordinates to observations. Disabled by default.
              </Text>
            </View>
            <Switch
              value={settings.locationTaggingEnabled}
              onValueChange={handleToggleLocation}
              trackColor={{ false: '#D1D5DB', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Model Provenance & Licensing (FR-073) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Model Provenance & Specs
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>Model Name</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{CURRENT_MODEL_VERSION.name}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>Version</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{CURRENT_MODEL_VERSION.version}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>Runtime Format</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{CURRENT_MODEL_VERSION.runtimeFormat}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>Preprocessing</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{CURRENT_MODEL_VERSION.preprocessingVersion}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>License</Text>
            <Text style={[styles.specVal, { color: theme.primary, fontWeight: '700' }]}>
              {CURRENT_MODEL_VERSION.licenseId}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.textSecondary }]}>Checksum</Text>
            <Text
              numberOfLines={1}
              style={[styles.specVal, { color: theme.textSecondary, fontSize: 11, maxWidth: '60%' }]}>
              {CURRENT_MODEL_VERSION.checksum}
            </Text>
          </View>
        </View>
      </View>

      {/* Media & Content Attribution (FR-074) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Content & Media Attribution
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.attributionItem}>
            <Text style={[styles.attribTitle, { color: theme.text }]}>
              Bird Vocalizations & Reference Audio
            </Text>
            <Text style={[styles.attribDesc, { color: theme.textSecondary }]}>
              Curated from Macaulay Library, Cornell Lab of Ornithology, and Xeno-Canto community contributors under Creative Commons (CC BY-SA 4.0).
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.attributionItem}>
            <Text style={[styles.attribTitle, { color: theme.text }]}>
              Species Profiles & Spotting Guides
            </Text>
            <Text style={[styles.attribDesc, { color: theme.textSecondary }]}>
              Written for outdoor education following North American ornithological field guides and open birding taxonomies.
            </Text>
          </View>
        </View>
      </View>

      {/* Danger Zone: Storage Management (FR-072, FR-078) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>
          Data Management
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#FCA5A5' }]}>
          <Pressable
            style={({ pressed }) => [styles.dangerRow, pressed && { opacity: 0.7 }]}
            onPress={handleDeleteAllRecordings}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dangerLabel, { color: theme.text }]}>
                Delete All Retained Audio Files
              </Text>
              <Text style={[styles.dangerSub, { color: theme.textSecondary }]}>
                Frees storage space while keeping your journal entries intact.
              </Text>
            </View>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            style={({ pressed }) => [styles.dangerRow, pressed && { opacity: 0.7 }]}
            onPress={handleResetAllData}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dangerLabel, { color: '#DC2626' }]}>
                Reset All Application Data
              </Text>
              <Text style={[styles.dangerSub, { color: theme.textSecondary }]}>
                Permanently wipes all journal observations, audio, and challenge points.
              </Text>
            </View>
            <Ionicons name="nuclear-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>
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
    gap: 20,
    paddingBottom: 40,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#AEEED3',
    padding: 12,
    borderRadius: 12,
  },
  actionBannerText: {
    fontFamily: Fonts.sans,
    color: '#164E47',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  pledgeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pledgeTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pledgeText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
    letterSpacing: -0.2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  specKey: {
    fontSize: 13,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  attributionItem: {
    padding: 16,
    gap: 4,
  },
  attribTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  attribDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  dangerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
});
