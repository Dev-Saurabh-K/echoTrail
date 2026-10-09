import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { getDatabase } from '@/core/database';
import { EchoTrailError } from '@/core/errors';
import { speciesRepository } from './speciesRepository';
import {
  NewObservation,
  Observation,
  ObservationCandidate,
  ObservationUpdate,
} from '@/shared/types';

export class ObservationRepository {
  async save(newObs: NewObservation): Promise<string> {
    const db = await getDatabase();
    const observationId = `obs_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`;
    const observedAt = newObs.observedAt || new Date().toISOString();

    try {
      await db.withTransactionAsync(async () => {
        // Insert observation
        await db.runAsync(
          `INSERT INTO observations (
            observation_id, observed_at, status, notes, audio_path,
            model_version_id, latitude, longitude
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            observationId,
            observedAt,
            newObs.status,
            newObs.notes || null,
            newObs.audioPath || null,
            newObs.modelVersionId,
            newObs.latitude || null,
            newObs.longitude || null,
          ]
        );

        // Insert candidates
        for (const c of newObs.candidates) {
          const candidateId = `cand_${observationId}_${c.rank}`;
          await db.runAsync(
            `INSERT INTO candidates (
              candidate_id, observation_id, species_id, rank, score, score_type
            ) VALUES (?, ?, ?, ?, ?, ?);`,
            [candidateId, observationId, c.speciesId, c.rank, c.score, c.scoreType]
          );
        }
      });

      return observationId;
    } catch (err: any) {
      throw new EchoTrailError(
        'STORAGE_WRITE_FAILED',
        `Failed to save observation to SQLite: ${err.message}`,
        'Check disk permissions and storage space.'
      );
    }
  }

  async getById(id: string): Promise<Observation | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM observations WHERE observation_id = ?;',
      [id]
    );

    if (!row) return null;

    const candidateRows = await db.getAllAsync<any>(
      'SELECT * FROM candidates WHERE observation_id = ? ORDER BY rank ASC;',
      [id]
    );

    const candidates: ObservationCandidate[] = [];
    for (const c of candidateRows) {
      const species = await speciesRepository.getById(c.species_id);
      candidates.push({
        candidateId: c.candidate_id,
        observationId: c.observation_id,
        speciesId: c.species_id,
        rank: c.rank,
        score: c.score,
        scoreType: c.score_type,
        species: species || undefined,
      });
    }

    return {
      observationId: row.observation_id,
      observedAt: row.observed_at,
      status: row.status,
      notes: row.notes,
      audioPath: row.audio_path,
      modelVersionId: row.model_version_id,
      latitude: row.latitude,
      longitude: row.longitude,
      candidates,
    };
  }

  async list(limit = 100, offset = 0): Promise<Observation[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM observations ORDER BY observed_at DESC LIMIT ? OFFSET ?;',
      [limit, offset]
    );

    const observations: Observation[] = [];
    for (const row of rows) {
      const candidateRows = await db.getAllAsync<any>(
        'SELECT * FROM candidates WHERE observation_id = ? ORDER BY rank ASC;',
        [row.observation_id]
      );

      const candidates: ObservationCandidate[] = [];
      for (const c of candidateRows) {
        const species = await speciesRepository.getById(c.species_id);
        candidates.push({
          candidateId: c.candidate_id,
          observationId: c.observation_id,
          speciesId: c.species_id,
          rank: c.rank,
          score: c.score,
          scoreType: c.score_type,
          species: species || undefined,
        });
      }

      observations.push({
        observationId: row.observation_id,
        observedAt: row.observed_at,
        status: row.status,
        notes: row.notes,
        audioPath: row.audio_path,
        modelVersionId: row.model_version_id,
        latitude: row.latitude,
        longitude: row.longitude,
        candidates,
      });
    }

    return observations;
  }

  async update(id: string, changes: ObservationUpdate): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (changes.status !== undefined) {
      fields.push('status = ?');
      values.push(changes.status);
    }
    if (changes.notes !== undefined) {
      fields.push('notes = ?');
      values.push(changes.notes);
    }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE observations SET ${fields.join(', ')} WHERE observation_id = ?;`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();

    // Check if there is an audio file to delete (FR-058)
    const obs = await db.getFirstAsync<any>(
      'SELECT audio_path FROM observations WHERE observation_id = ?;',
      [id]
    );

    if (obs?.audio_path) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(obs.audio_path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(obs.audio_path, { idempotent: true });
        }
      } catch {
        // Silently continue if file is already gone or cannot be accessed
      }
    }

    await db.withTransactionAsync(async () => {
      // Candidates will cascade, but delete explicitly for safety
      await db.runAsync('DELETE FROM candidates WHERE observation_id = ?;', [id]);
      await db.runAsync('DELETE FROM observations WHERE observation_id = ?;', [id]);
    });
  }

  async deleteAllObservations(): Promise<number> {
    const all = await this.list();
    for (const obs of all) {
      await this.delete(obs.observationId);
    }
    return all.length;
  }
}

export const observationRepository = new ObservationRepository();
