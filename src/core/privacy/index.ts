import * as FileSystem from 'expo-file-system';
import { getDatabase } from '@/core/database';
import { observationRepository } from '@/data/repositories/observationRepository';

export interface PrivacySettings {
  retainAudioWithObservations: boolean;
  locationTaggingEnabled: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  retainAudioWithObservations: true,
  locationTaggingEnabled: false,
};

let cachedSettings: PrivacySettings = { ...DEFAULT_SETTINGS };

export class PrivacyManager {
  getSettings(): PrivacySettings {
    return { ...cachedSettings };
  }

  updateSettings(partial: Partial<PrivacySettings>): PrivacySettings {
    cachedSettings = {
      ...cachedSettings,
      ...partial,
    };
    return { ...cachedSettings };
  }

  async deleteAllRecordings(): Promise<number> {
    const observations = await observationRepository.list(1000);
    let deletedFiles = 0;

    for (const obs of observations) {
      if (obs.audioPath) {
        try {
          const info = await FileSystem.getInfoAsync(obs.audioPath);
          if (info.exists) {
            await FileSystem.deleteAsync(obs.audioPath, { idempotent: true });
            deletedFiles++;
          }
        } catch {
          // ignore
        }
        await observationRepository.update(obs.observationId, {
          notes: obs.notes, // keep notes but clear audio_path
        });
      }
    }

    const db = await getDatabase();
    await db.runAsync('UPDATE observations SET audio_path = NULL;');
    return deletedFiles;
  }

  async resetAllApplicationData(): Promise<void> {
    const db = await getDatabase();
    await this.deleteAllRecordings();

    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM challenge_progress;');
      await db.runAsync('DELETE FROM candidates;');
      await db.runAsync('DELETE FROM observations;');
    });
  }
}

export const privacyManager = new PrivacyManager();
