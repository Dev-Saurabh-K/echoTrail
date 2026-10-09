import { CURRENT_MODEL_VERSION } from '@/core/database';
import { EchoTrailError } from '@/core/errors';
import { SPECIES_CATALOG } from '@/data/species';
import {
  AudioInput,
  BirdClassifier,
  BirdPrediction,
  ConfidenceLabel,
} from '@/shared/types';

export class OnDeviceBirdClassifier implements BirdClassifier {
  private isLoaded = false;
  readonly modelVersion = CURRENT_MODEL_VERSION;

  async loadModel(): Promise<void> {
    // Simulates local tensor runtime initialization and weights verification
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.isLoaded = true;
  }

  async classify(audio: AudioInput): Promise<BirdPrediction[]> {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    // Validation 1: Duration check (FR-016, FR-023)
    if (audio.durationMs < 2000) {
      throw new EchoTrailError(
        'AUDIO_TOO_SHORT',
        `Audio duration (${(audio.durationMs / 1000).toFixed(1)}s) is too short. Minimum required is 2.0s.`,
        'Record for at least 5 to 10 seconds of continuous birdsong.'
      );
    }

    // Validation 2: Silence / unusable audio check (FR-023, UC-02)
    if (audio.simulatedNoiseLevel === 'silent') {
      throw new EchoTrailError(
        'AUDIO_UNUSABLE',
        'Audio signal level is below usable acoustic threshold (-50dB SNR). No bird vocalizations detected.',
        'Move closer to where you hear the bird or check microphone sensitivity.'
      );
    }

    // Simulate inference latency (NFR-001 target < 5 seconds)
    // Realistic on-device inference takes 600ms - 1200ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Handle high noise / ambiguous recordings (UC-02)
    if (audio.simulatedNoiseLevel === 'high') {
      // Ambiguous / uncertain result: top scores are low and close
      const candidates: BirdPrediction[] = [
        {
          speciesId: 'blue_jay',
          rank: 1,
          score: 0.44,
          scoreType: 'probability',
          confidenceLabel: 'uncertain',
          explanation:
            'Ambiguous detection. Significant background wind buffeting obscured harmonic overtones.',
        },
        {
          speciesId: 'mourning_dove',
          rank: 2,
          score: 0.39,
          scoreType: 'probability',
          confidenceLabel: 'uncertain',
          explanation:
            'Low signal-to-noise ratio. Secondary pitch contour resembles low mourning dove coo.',
        },
        {
          speciesId: 'song_sparrow',
          rank: 3,
          score: 0.17,
          scoreType: 'probability',
          confidenceLabel: 'low',
          explanation:
            'Weak acoustic evidence detected in upper 4kHz frequency band.',
        },
      ];
      return candidates;
    }

    // Check if target species hint is given (e.g. from bundled sample)
    const targetSpeciesId =
      (audio as any).targetSpeciesHint ||
      this.inferTargetFromUri(audio.uri) ||
      'robin_american';

    // Construct ranked candidates based on acoustic profile
    const targetSpecies =
      SPECIES_CATALOG.find((s) => s.speciesId === targetSpeciesId) ||
      SPECIES_CATALOG[0];

    // Pick 2 realistic confusion candidates from other species
    const otherSpecies = SPECIES_CATALOG.filter(
      (s) => s.speciesId !== targetSpecies.speciesId
    );
    const secondarySpecies = otherSpecies[0];
    const tertiarySpecies = otherSpecies[1];

    const topScore = Number((0.84 + Math.random() * 0.1).toFixed(2));
    const secondaryScore = Number((0.36 + Math.random() * 0.12).toFixed(2));
    const tertiaryScore = Number((0.14 + Math.random() * 0.08).toFixed(2));

    const topConfidence: ConfidenceLabel =
      topScore >= 0.75 ? 'high' : topScore >= 0.5 ? 'moderate' : 'low';

    return [
      {
        speciesId: targetSpecies.speciesId,
        rank: 1,
        score: topScore,
        scoreType: 'probability',
        confidenceLabel: topConfidence,
        explanation: `Strong acoustic match in characteristic ${targetSpecies.commonName} frequency range (${this.getFrequencyRange(targetSpecies.speciesId)}).`,
      },
      {
        speciesId: secondarySpecies.speciesId,
        rank: 2,
        score: secondaryScore,
        scoreType: 'probability',
        confidenceLabel: 'low',
        explanation: `Partial harmonic overlap with ${secondarySpecies.commonName} call cadence.`,
      },
      {
        speciesId: tertiarySpecies.speciesId,
        rank: 3,
        score: tertiaryScore,
        scoreType: 'probability',
        confidenceLabel: 'low',
        explanation: `Secondary spectral match in upper frequency harmonics.`,
      },
    ];
  }

  async dispose(): Promise<void> {
    this.isLoaded = false;
  }

  private inferTargetFromUri(uri: string): string | null {
    const lower = uri.toLowerCase();
    for (const s of SPECIES_CATALOG) {
      if (
        lower.includes(s.speciesId) ||
        lower.includes(s.commonName.toLowerCase().replace(/\s+/g, '_'))
      ) {
        return s.speciesId;
      }
    }
    return null;
  }

  private getFrequencyRange(speciesId: string): string {
    switch (speciesId) {
      case 'chickadee_black_capped':
        return '3.2 kHz – 8.0 kHz';
      case 'cardinal_northern':
        return '2.0 kHz – 4.5 kHz';
      case 'mourning_dove':
        return '450 Hz – 1.2 kHz';
      case 'red_tailed_hawk':
        return '1.8 kHz – 4.0 kHz';
      default:
        return '1.5 kHz – 6.0 kHz';
    }
  }
}

export const birdClassifier = new OnDeviceBirdClassifier();
