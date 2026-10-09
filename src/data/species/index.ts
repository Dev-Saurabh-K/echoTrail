import { Species } from '@/shared/types';

export const SPECIES_CATALOG: Species[] = [
  {
    speciesId: 'robin_american',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    family: 'Turdidae (Thrushes)',
    description:
      'A familiar songbird with a warm reddish-orange breast and rich caroling whistle. Known across North America as an early harbinger of spring.',
    habitat: 'Lawns, parks, suburban gardens, deciduous forests, and woodland edges.',
    spottingHint:
      'Look on open grass lawns where they run a few paces, stop with cocked heads to spot worms, or perch high on exposed tree branches at sunrise.',
    visualFeatures:
      'Round body, dark charcoal-to-black head and back, rich brick-red breast, white lower belly, and bright yellow bill.',
    callDescription:
      'Clear, liquid musical phrases: "cheerily, cheer-up, cheer-up, cheerily, cheer-up" rising and falling in pitch.',
    referenceAudioPath: 'assets/audio/robin.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'cardinal_northern',
    commonName: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    family: 'Cardinalidae (Cardinals)',
    description:
      'One of the most vivid North American birds. Males are radiant crimson with a proud crest, while females show warm buff-olive with red accents.',
    habitat: 'Dense shrubby areas, forest edges, suburban hedge rows, and backyard feeders.',
    spottingHint:
      'Search low dense brush and thick vines, or near bird feeders offering black oil sunflower seeds. Often the first and last bird at feeders.',
    visualFeatures:
      'Conical heavy reddish-orange bill, prominent crest on top of head, black facial mask around eyes and throat.',
    callDescription:
      'Loud, ringing two-part whistle: "cheer, cheer, cheer, what-what-what-what" or sharp metallic "chip!" alarm notes.',
    referenceAudioPath: 'assets/audio/cardinal.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'chickadee_black_capped',
    commonName: 'Black-capped Chickadee',
    scientificName: 'Poecile atricapillus',
    family: 'Paridae (Tits & Chickadees)',
    description:
      'An inquisitive, acrobatic little bird that does not fear people. Famous for hiding thousands of seeds across winter territories.',
    habitat: 'Mixed deciduous and coniferous woodlands, parks, yards with mature trees.',
    spottingHint:
      'Watch outer twigs and bark crevices where they hang upside-down gleaning insects and seeds. Responds curiosity to gentle "pishing" sounds.',
    visualFeatures:
      'Tiny spherical body, black cap and throat bib, bright white cheeks, soft gray wings and tail, buff flanks.',
    callDescription:
      'Signature husky "chick-a-dee-dee-dee" (more "dees" signal predator alert level) and sweet whistled two-note spring song "fee-bee".',
    referenceAudioPath: 'assets/audio/chickadee.mp3',
    contentSource: 'Macaulay Library / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'blue_jay',
    commonName: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    family: 'Corvidae (Crows & Jays)',
    description:
      'A brilliant, intelligent, and vocal forest sentinel. Known to mimic hawk calls to alert other birds or clear feeder areas.',
    habitat: 'Oak and beech woodlands, suburban parks, residential yards with mature oak trees.',
    spottingHint:
      'Listen for boisterous alarm calls high in oak canopies. Watch them harvest and cache acorns in autumn by pounding them with their bills.',
    visualFeatures:
      'Striking blue crest and back, black necklace across chest, white-spotted blue wings and tail with black barring.',
    callDescription:
      'Loud, harsh descending "jeer! jeer!" or musical bell-like "queedle-queedle" squeaks.',
    referenceAudioPath: 'assets/audio/blue_jay.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'mourning_dove',
    commonName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    family: 'Columbidae (Pigeons & Doves)',
    description:
      'A graceful, slender-tailed dove with a gentle, sorrowful cooing call that beginners often mistake for an owl.',
    habitat: 'Open country, farmland, roadsides, telephone wires, suburban yards, and grasslands.',
    spottingHint:
      'Look on telephone wires, fence lines, or foraging on bare ground for dropped seeds. Listen for whistle of wing feathers upon takeoff.',
    visualFeatures:
      'Smooth tan-gray body, small rounded head, black spots on wings, long pointed tail with white outer tips.',
    callDescription:
      'Soft, resonant, mournful owl-like coo: "coo-OO, oo, oo, oo" with the second syllable accented and highest in pitch.',
    referenceAudioPath: 'assets/audio/mourning_dove.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'song_sparrow',
    commonName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    family: 'Passerellidae (New World Sparrows)',
    description:
      'One of the most widespread and melodious sparrows. Males boast hundreds of song variations performed from high weed stalks.',
    habitat: 'Brushy fields, marsh edges, thickets along streams, residential shrubs and hedges.',
    spottingHint:
      'Perches on top of bushes or fence posts with head thrown back in song, then pumps its long tail up and down when flying across open gaps.',
    visualFeatures:
      'Streaked reddish-brown and gray plumage with a distinct dark brown central spot on the breast.',
    callDescription:
      'Complex melodic song starting with 2-3 sweet introductory notes, followed by a musical trill and buzz: "sweet, sweet, sweet, trrrr, chit".',
    referenceAudioPath: 'assets/audio/song_sparrow.mp3',
    contentSource: 'Macaulay Library / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'barn_swallow',
    commonName: 'Barn Swallow',
    scientificName: 'Hirundo rustica',
    family: 'Hirundinidae (Swallows)',
    description:
      'The most widespread swallow species in the world, renowned for extraordinary aerobatic swoops skimming inches over water and fields.',
    habitat: 'Open meadows, farm country, ponds, under bridge eaves, and barn rafters.',
    spottingHint:
      'Watch low over fields and ponds on warm afternoons, snapping flying insects from midair with dazzling banking turns.',
    visualFeatures:
      'Cobalt blue back, tawny cinnamon underparts, chestnut forehead and throat, deeply forked swallow tail with white spots.',
    callDescription:
      'Rapid cheerful warbling twitter mixed with sharp "wit-wit" flight calls and mechanical clicking sounds.',
    referenceAudioPath: 'assets/audio/barn_swallow.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
  {
    speciesId: 'red_tailed_hawk',
    commonName: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    family: 'Accipitridae (Hawks & Eagles)',
    description:
      'The iconic North American raptor whose piercing scream is famously dubbed over almost every bird of prey in movies.',
    habitat: 'Open country, pastures, motorway verges, forest edges, and city parks.',
    spottingHint:
      'Scan highway light poles, fence posts, and dead tree snags for a large bulky perched silhouette, or riding thermals in wide circles.',
    visualFeatures:
      'Broad rounded wings, short fan-shaped rust-cinnamon tail, mottled brown back, pale belly with a darker streaked "belly band".',
    callDescription:
      'Fierce, raspy, descending scream lasting 2-3 seconds: "kreeeeee-aaar", heard when soaring over territory.',
    referenceAudioPath: 'assets/audio/red_tailed_hawk.mp3',
    contentSource: 'Cornell Lab / Xeno-Canto (CC BY-SA 4.0)',
  },
];

export function getSpeciesById(speciesId: string): Species | undefined {
  return SPECIES_CATALOG.find((s) => s.speciesId === speciesId);
}
