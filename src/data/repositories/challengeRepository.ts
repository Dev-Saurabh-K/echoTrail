import * as Crypto from 'expo-crypto';
import { getDatabase } from '@/core/database';
import { ChallengeWithProgress, Observation } from '@/shared/types';

export class ChallengeRepository {
  async listWithProgress(): Promise<ChallengeWithProgress[]> {
    const db = await getDatabase();
    const challenges = await db.getAllAsync<any>(
      'SELECT * FROM challenges WHERE active = 1 ORDER BY points ASC;'
    );

    const result: ChallengeWithProgress[] = [];

    for (const c of challenges) {
      // Get all progress entries for this challenge
      const progressEntries = await db.getAllAsync<any>(
        'SELECT * FROM challenge_progress WHERE challenge_id = ?;',
        [c.challenge_id]
      );

      // Total progress value achieved
      const totalProgress = progressEntries.reduce(
        (sum, p) => sum + (p.progress_value || 0),
        0
      );

      const isCompleted = totalProgress >= c.target_count;
      const completedEntry = progressEntries.find((p) => p.completed_at != null);

      result.push({
        challengeId: c.challenge_id,
        title: c.title,
        description: c.description,
        challengeType: c.challenge_type,
        targetCount: c.target_count,
        points: c.points,
        active: c.active === 1,
        iconName: c.icon_name,
        currentValue: Math.min(totalProgress, c.target_count),
        isCompleted,
        completedAt: completedEntry?.completed_at || null,
        pointsAwarded: isCompleted ? c.points : 0,
      });
    }

    return result;
  }

  async getTotalPoints(): Promise<number> {
    const challenges = await this.listWithProgress();
    return challenges
      .filter((c) => c.isCompleted)
      .reduce((sum, c) => sum + c.points, 0);
  }

  /**
   * Evaluates all challenges against the current state of observations
   * Ensuring idempotent evaluation where each qualifying observation only counts once.
   */
  async evaluateAllChallenges(allObservations: Observation[]): Promise<{
    newlyCompleted: ChallengeWithProgress[];
  }> {
    const db = await getDatabase();
    const currentChallenges = await this.listWithProgress();
    const newlyCompleted: ChallengeWithProgress[] = [];

    for (const challenge of currentChallenges) {
      if (challenge.isCompleted) {
        // Already finished
        continue;
      }

      let qualifyingCount = 0;
      let latestQualifyingObsId: string | null = null;

      switch (challenge.challengeType) {
        case 'first_observation':
          qualifyingCount = allObservations.length >= 1 ? 1 : 0;
          if (allObservations.length > 0) {
            latestQualifyingObsId = allObservations[0].observationId;
          }
          break;

        case 'confirmed_spotting':
          const spottings = allObservations.filter((o) => o.status === 'spotted');
          qualifyingCount = spottings.length;
          if (spottings.length > 0) {
            latestQualifyingObsId = spottings[0].observationId;
          }
          break;

        case 'distinct_species': {
          const uniqueSpecies = new Set<string>();
          for (const obs of allObservations) {
            if (obs.candidates.length > 0) {
              uniqueSpecies.add(obs.candidates[0].speciesId);
            }
          }
          qualifyingCount = uniqueSpecies.size;
          if (allObservations.length > 0) {
            latestQualifyingObsId = allObservations[0].observationId;
          }
          break;
        }

        case 'woodland_habitat': {
          const woodlandObs = allObservations.filter((o) => {
            const top = o.candidates[0]?.species;
            if (!top) return false;
            return (
              top.habitat.toLowerCase().includes('forest') ||
              top.habitat.toLowerCase().includes('woodland') ||
              top.habitat.toLowerCase().includes('deciduous')
            );
          });
          qualifyingCount = woodlandObs.length;
          if (woodlandObs.length > 0) {
            latestQualifyingObsId = woodlandObs[0].observationId;
          }
          break;
        }

        case 'total_observations':
          qualifyingCount = allObservations.length;
          if (allObservations.length > 0) {
            latestQualifyingObsId = allObservations[0].observationId;
          }
          break;

        case 'morning_observation': {
          const morningObs = allObservations.filter((o) => {
            const d = new Date(o.observedAt);
            const hour = d.getHours();
            return hour >= 4 && hour < 9; // dawn chorus: 4 AM - 9 AM
          });
          qualifyingCount = morningObs.length;
          if (morningObs.length > 0) {
            latestQualifyingObsId = morningObs[0].observationId;
          }
          break;
        }
      }

      if (qualifyingCount > challenge.currentValue) {
        const isNowCompleted = qualifyingCount >= challenge.targetCount;
        const progressId = `prog_${challenge.challengeId}_${Crypto.randomUUID().slice(0, 6)}`;

        // Clear previous progress record for this challenge to maintain clean single progress state
        await db.runAsync('DELETE FROM challenge_progress WHERE challenge_id = ?;', [
          challenge.challengeId,
        ]);

        await db.runAsync(
          `INSERT INTO challenge_progress (
            progress_id, challenge_id, observation_id, progress_value, points_awarded, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [
            progressId,
            challenge.challengeId,
            latestQualifyingObsId,
            qualifyingCount,
            isNowCompleted ? challenge.points : 0,
            isNowCompleted ? new Date().toISOString() : null,
          ]
        );

        if (isNowCompleted) {
          newlyCompleted.push({
            ...challenge,
            currentValue: challenge.targetCount,
            isCompleted: true,
            completedAt: new Date().toISOString(),
            pointsAwarded: challenge.points,
          });
        }
      }
    }

    return { newlyCompleted };
  }
}

export const challengeRepository = new ChallengeRepository();
