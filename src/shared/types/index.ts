export type SightingStatus = 'spotted' | 'heard_not_seen' | 'unconfirmed';

export type ScoreType = 'raw' | 'logit' | 'probability';

export type ConfidenceLabel = 'high' | 'moderate' | 'low' | 'uncertain';

export interface BirdPrediction {
  speciesId: string;
  rank: number;
  score: number;
  scoreType: ScoreType;
  confidenceLabel: ConfidenceLabel;
  explanation: string;
}

export interface AudioInput {
  uri: string;
  sampleRate: number;
  channels: number;
  durationMs: number;
  simulatedNoiseLevel?: 'low' | 'moderate' | 'high' | 'silent';
  targetSpeciesHint?: string;
}

export interface BirdClassifier {
  loadModel(): Promise<void>;
  classify(audio: AudioInput): Promise<BirdPrediction[]>;
  dispose(): Promise<void>;
}

export interface Species {
  speciesId: string;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  habitat: string;
  spottingHint: string;
  visualFeatures: string;
  callDescription: string;
  referenceAudioPath?: string;
  imagePath?: string;
  contentSource: string;
}

export interface ObservationCandidate {
  candidateId: string;
  observationId: string;
  speciesId: string;
  rank: number;
  score: number;
  scoreType: ScoreType;
  species?: Species;
}

export interface Observation {
  observationId: string;
  observedAt: string; // ISO 8601
  status: SightingStatus;
  notes?: string | null;
  audioPath?: string | null;
  modelVersionId: string;
  latitude?: number | null;
  longitude?: number | null;
  candidates: ObservationCandidate[];
}

export interface NewObservation {
  observedAt?: string;
  status: SightingStatus;
  notes?: string;
  audioPath?: string | null;
  modelVersionId: string;
  latitude?: number | null;
  longitude?: number | null;
  candidates: {
    speciesId: string;
    rank: number;
    score: number;
    scoreType: ScoreType;
  }[];
}

export interface ObservationUpdate {
  status?: SightingStatus;
  notes?: string | null;
}

export interface ModelVersion {
  modelVersionId: string;
  name: string;
  version: string;
  licenseId: string;
  checksum: string;
  preprocessingVersion: string;
  runtimeFormat: string;
  description: string;
}

export type ChallengeType =
  | 'first_observation'
  | 'confirmed_spotting'
  | 'distinct_species'
  | 'woodland_habitat'
  | 'total_observations'
  | 'morning_observation';

export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  challengeType: ChallengeType;
  targetCount: number;
  points: number;
  active: boolean;
  iconName: string;
}

export interface ChallengeWithProgress extends Challenge {
  currentValue: number;
  isCompleted: boolean;
  completedAt?: string | null;
  pointsAwarded: number;
}

export interface AudioSampleItem {
  id: string;
  title: string;
  speciesId: string;
  durationSeconds: number;
  description: string;
  uri?: string;
  isBundled: boolean;
  simulatedNoiseLevel?: 'low' | 'moderate' | 'high' | 'silent';
}
