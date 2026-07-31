export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'unknown';

export interface AlternateMatch {
  commonName: string;
  scientificName: string;
  confidence: number;
  distinguishingFeature: string;
}

export interface ShellIdentification {
  visualAnalysis?: string;
  isValidSpecimen?: boolean;
  isValidShell?: boolean; // backwards compatibility
  specimenType?: 'seashell' | 'coral' | 'sharkTooth' | 'other';
  commonName: string;
  commonAliases?: string[];
  scientificName: string;
  family: string;
  confidence: number; // 0 to 1
  rarity: RarityLevel;
  habitatNote: string;
  funFact: string;
  isProtectedSpecies: boolean;
  protectedNote: string;
  alternateMatches?: AlternateMatch[];
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  beachName?: string;
}

export interface SavedFind {
  id: string;
  photoUrl: string;
  identification: ShellIdentification;
  timestamp: string; // ISO string
  location: LocationInfo;
  userNotes?: string;
}

export interface SampleShell {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  category: string;
  sampleData: ShellIdentification;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface SpotLocationResult {
  speciesName: string;
  guide: string;
  sources: GroundingSource[];
  searchQueries?: string[];
  userLocation?: { lat: number; lon: number } | null;
}

