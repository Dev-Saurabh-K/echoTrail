import * as SQLite from 'expo-sqlite';
import { SPECIES_CATALOG } from '@/data/species';
import { ModelVersion } from '@/shared/types';

export const CURRENT_MODEL_VERSION: ModelVersion = {
  modelVersionId: 'model_acoustic_tiny_v1',
  name: 'BirdAcoustic-Tiny',
  version: '1.0.4',
  licenseId: 'Apache-2.0',
  checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  preprocessingVersion: 'v1.0 (16kHz-mono-hann-1024)',
  runtimeFormat: 'OnDevice-AcousticClassifier',
  description: 'On-device multi-band spectral pattern matching with confidence calibration for regional songbirds.',
};

export const INITIAL_CHALLENGES = [
  {
    challengeId: 'chal_first_echo',
    title: 'First Echo',
    description: 'Listen to and identify your very first bird in the wild.',
    challengeType: 'first_observation',
    targetCount: 1,
    points: 100,
    active: 1,
    iconName: 'mic',
  },
  {
    challengeId: 'chal_keen_spotter',
    title: 'Keen Spotter',
    description: 'Visually confirm and spot a bird after hearing its call.',
    challengeType: 'confirmed_spotting',
    targetCount: 1,
    points: 150,
    active: 1,
    iconName: 'eye',
  },
  {
    challengeId: 'chal_backyard_bio',
    title: 'Backyard Biologist',
    description: 'Identify 3 distinct bird species in your area.',
    challengeType: 'distinct_species',
    targetCount: 3,
    points: 250,
    active: 1,
    iconName: 'leaf',
  },
  {
    challengeId: 'chal_woodland_scout',
    title: 'Woodland Scout',
    description: 'Hear and identify a woodland forest species (e.g. Chickadee, Blue Jay, Robin).',
    challengeType: 'woodland_habitat',
    targetCount: 1,
    points: 150,
    active: 1,
    iconName: 'tree',
  },
  {
    challengeId: 'chal_field_naturalist',
    title: 'Field Naturalist',
    description: 'Record and save 5 observations in your field journal.',
    challengeType: 'total_observations',
    targetCount: 5,
    points: 300,
    active: 1,
    iconName: 'book',
  },
  {
    challengeId: 'chal_dawn_chorus',
    title: 'Dawn Chorus',
    description: 'Record a bird singing during the morning dawn chorus (before 9 AM).',
    challengeType: 'morning_observation',
    targetCount: 1,
    points: 200,
    active: 1,
    iconName: 'sun',
  },
];

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (!initPromise) {
    initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('echotrail.db');
      await initializeDatabase(db);
      dbInstance = db;
      return db;
    })();
  }
  return initPromise;
}

export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables according to SRS Section 8.3
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS species (
      species_id TEXT PRIMARY KEY,
      common_name TEXT NOT NULL,
      scientific_name TEXT NOT NULL,
      family TEXT NOT NULL,
      description TEXT NOT NULL,
      habitat TEXT NOT NULL,
      spotting_hint TEXT NOT NULL,
      visual_features TEXT NOT NULL,
      call_description TEXT NOT NULL,
      reference_audio_path TEXT,
      image_path TEXT,
      content_source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS model_versions (
      model_version_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      license_id TEXT NOT NULL,
      checksum TEXT NOT NULL,
      preprocessing_version TEXT NOT NULL,
      runtime_format TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS observations (
      observation_id TEXT PRIMARY KEY,
      observed_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('spotted', 'heard_not_seen', 'unconfirmed')),
      notes TEXT,
      audio_path TEXT,
      model_version_id TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY (model_version_id) REFERENCES model_versions (model_version_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS candidates (
      candidate_id TEXT PRIMARY KEY,
      observation_id TEXT NOT NULL,
      species_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      score REAL NOT NULL,
      score_type TEXT NOT NULL,
      FOREIGN KEY (observation_id) REFERENCES observations (observation_id) ON DELETE CASCADE,
      FOREIGN KEY (species_id) REFERENCES species (species_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS challenges (
      challenge_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      target_count INTEGER NOT NULL,
      points INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      icon_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_progress (
      progress_id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      observation_id TEXT,
      progress_value INTEGER NOT NULL DEFAULT 0,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (challenge_id) REFERENCES challenges (challenge_id) ON DELETE CASCADE,
      FOREIGN KEY (observation_id) REFERENCES observations (observation_id) ON DELETE SET NULL
    );
  `);

  // Seed species catalog
  for (const s of SPECIES_CATALOG) {
    await db.runAsync(
      `INSERT OR REPLACE INTO species (
        species_id, common_name, scientific_name, family, description, habitat,
        spotting_hint, visual_features, call_description, reference_audio_path,
        image_path, content_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.speciesId,
        s.commonName,
        s.scientificName,
        s.family,
        s.description,
        s.habitat,
        s.spottingHint,
        s.visualFeatures,
        s.callDescription,
        s.referenceAudioPath || null,
        s.imagePath || null,
        s.contentSource,
      ]
    );
  }

  // Seed current model version
  await db.runAsync(
    `INSERT OR REPLACE INTO model_versions (
      model_version_id, name, version, license_id, checksum,
      preprocessing_version, runtime_format, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      CURRENT_MODEL_VERSION.modelVersionId,
      CURRENT_MODEL_VERSION.name,
      CURRENT_MODEL_VERSION.version,
      CURRENT_MODEL_VERSION.licenseId,
      CURRENT_MODEL_VERSION.checksum,
      CURRENT_MODEL_VERSION.preprocessingVersion,
      CURRENT_MODEL_VERSION.runtimeFormat,
      CURRENT_MODEL_VERSION.description,
    ]
  );

  // Seed default challenges
  for (const c of INITIAL_CHALLENGES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO challenges (
        challenge_id, title, description, challenge_type,
        target_count, points, active, icon_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.challengeId, c.title, c.description, c.challengeType, c.targetCount, c.points, c.active, c.iconName]
    );
  }
}
