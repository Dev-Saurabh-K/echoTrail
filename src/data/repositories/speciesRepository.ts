import { getDatabase } from '@/core/database';
import { SPECIES_CATALOG } from '@/data/species';
import { Species } from '@/shared/types';

export class SpeciesRepository {
  async list(): Promise<Species[]> {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM species ORDER BY common_name ASC;'
      );
      if (rows && rows.length > 0) {
        return rows.map(this.mapRowToSpecies);
      }
    } catch {
      // Fallback to static catalog if DB is initializing
    }
    return SPECIES_CATALOG;
  }

  async getById(speciesId: string): Promise<Species | null> {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM species WHERE species_id = ?;',
        [speciesId]
      );
      if (row) {
        return this.mapRowToSpecies(row);
      }
    } catch {
      // Fallback
    }
    return SPECIES_CATALOG.find((s) => s.speciesId === speciesId) || null;
  }

  async search(query: string): Promise<Species[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    const all = await this.list();
    return all.filter(
      (s) =>
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.habitat.toLowerCase().includes(q)
    );
  }

  private mapRowToSpecies(row: any): Species {
    return {
      speciesId: row.species_id,
      commonName: row.common_name,
      scientificName: row.scientific_name,
      family: row.family,
      description: row.description,
      habitat: row.habitat,
      spottingHint: row.spotting_hint,
      visualFeatures: row.visual_features,
      callDescription: row.call_description,
      referenceAudioPath: row.reference_audio_path || undefined,
      imagePath: row.image_path || undefined,
      contentSource: row.content_source,
    };
  }
}

export const speciesRepository = new SpeciesRepository();
