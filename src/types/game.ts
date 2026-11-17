export type IslandId = 'interest' | 'lighthouse' | 'serendipity' | 'library';

export type HairStyleId = 'bob' | 'short' | 'ponytail';

export type HollandTypeId = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type HollandScores = Record<HollandTypeId, number>;

export interface FourSData {
  situation: string;
  self: string;
  support: string;
  strategy: string;
}

export interface SerendipityCard {
  id: string;
  text: string;
}

export type SerendipityAttitudeId =
  | 'curiosity'
  | 'persistence'
  | 'flexibility'
  | 'optimism'
  | 'risktaking';

export interface SerendipityAttitude {
  id: SerendipityAttitudeId;
  name: string;
  description: string;
}

export interface Chapter3State {
  cardId: string;
  attitudeId: SerendipityAttitudeId | null;
  completed: boolean;
}

export interface Chapter4State {
  bookTitle: string;
  firstSentence: string;
  letter: string;
  letterSkipped: boolean;
  allowPublicShare: boolean;
  completed: boolean;
}

export interface OutfitColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface HairStyleOption {
  id: HairStyleId;
  label: string;
}

export interface PlayerProfile {
  classCode: string;
  nickname: string;
  hairStyle: HairStyleId;
  outfitColor: string;
}

export interface WritingPromptConfig {
  promptId: string;
  islandId: IslandId;
  title: string;
  question: string;
  minLength: number;
  maxLength: number;
  starters: string[];
  example: string;
}

export interface IslandDefinition {
  id: IslandId;
  orderLabel: string;
  name: string;
  shortDesc: string;
  position: [number, number, number];
  dockPosition: [number, number, number];
  landingPosition: [number, number, number];
  writingSpotPosition: [number, number, number];
  walkRadius: number;
  walkInnerRadius?: number;
  accentColor: string;
  writingPrompt: WritingPromptConfig;
}

export interface SavedWritingRecord {
  promptId: string;
  content: string;
  allowShare: boolean;
  updatedAt: number;
  submittedAt?: number;
}
