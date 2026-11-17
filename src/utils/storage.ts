import {
  Chapter3State,
  Chapter4State,
  FourSData,
  HollandScores,
  PlayerProfile,
  SavedWritingRecord,
} from '../types/game';
import { DEFAULT_FOUR_S, DEFAULT_HOLLAND_SCORES } from '../data/chapters';

const PROFILE_KEY = 'nextpage:profile:v1';
const LOW_SPEC_KEY = 'nextpage:low-spec:v1';
const DRAFT_PREFIX = 'nextpage:writing:v1:';
const HOLLAND_KEY = 'nextpage:holland:v1';
const FOUR_S_KEY = 'nextpage:fours:v1';
const CH3_KEY = 'nextpage:ch3:v1';
const CH4_KEY = 'nextpage:ch4:v1';

export function loadSavedProfile(): Partial<PlayerProfile> | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PlayerProfile>;
  } catch {
    return null;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota or private mode failures
  }
}

export function loadLowSpecPreference(): boolean | null {
  try {
    const raw = localStorage.getItem(LOW_SPEC_KEY);
    if (raw === null) return null;
    return raw === 'true';
  } catch {
    return null;
  }
}

export function saveLowSpecPreference(enabled: boolean): void {
  try {
    localStorage.setItem(LOW_SPEC_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export function loadWritingDraft(promptId: string): SavedWritingRecord | null {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${promptId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedWritingRecord;
  } catch {
    return null;
  }
}

export function saveWritingDraft(record: SavedWritingRecord): void {
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${record.promptId}`, JSON.stringify(record));
  } catch {
    // Ignore
  }
}

export function loadHollandScores(): HollandScores {
  try {
    const raw = localStorage.getItem(HOLLAND_KEY);
    if (!raw) return DEFAULT_HOLLAND_SCORES;
    return { ...DEFAULT_HOLLAND_SCORES, ...(JSON.parse(raw) as Partial<HollandScores>) };
  } catch {
    return DEFAULT_HOLLAND_SCORES;
  }
}

export function saveHollandScores(scores: HollandScores): void {
  try {
    localStorage.setItem(HOLLAND_KEY, JSON.stringify(scores));
  } catch {
    // Ignore
  }
}

export function loadFourSData(): FourSData {
  try {
    const raw = localStorage.getItem(FOUR_S_KEY);
    if (!raw) return DEFAULT_FOUR_S;
    return { ...DEFAULT_FOUR_S, ...(JSON.parse(raw) as Partial<FourSData>) };
  } catch {
    return DEFAULT_FOUR_S;
  }
}

export function saveFourSData(data: FourSData): void {
  try {
    localStorage.setItem(FOUR_S_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

export function loadChapter3State(): Chapter3State | null {
  try {
    const raw = localStorage.getItem(CH3_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Chapter3State;
  } catch {
    return null;
  }
}

export function saveChapter3State(state: Chapter3State): void {
  try {
    localStorage.setItem(CH3_KEY, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export function loadChapter4State(): Chapter4State | null {
  try {
    const raw = localStorage.getItem(CH4_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Chapter4State;
  } catch {
    return null;
  }
}

export function saveChapter4State(state: Chapter4State): void {
  try {
    localStorage.setItem(CH4_KEY, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

const SHEET_DIGEST_KEY = 'nextpage:sheet-digest:v1';

export function loadSheetSubmittedDigest(): string | null {
  try {
    return localStorage.getItem(SHEET_DIGEST_KEY);
  } catch {
    return null;
  }
}

export function saveSheetSubmittedDigest(digest: string): void {
  try {
    localStorage.setItem(SHEET_DIGEST_KEY, digest);
  } catch {
    // Ignore
  }
}

