
export enum Mood {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  OKAY = 'OKAY',
  MEH = 'MEH',
  BAD = 'BAD'
}

export enum PetStage {
  EGG = 'EGG',
  HATCHLING = 'HATCHLING',
  JUVENILE = 'JUVENILE',
  GUARDIAN = 'GUARDIAN'
}

export enum PetStatus {
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  EMO = 'EMO'
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  icon: string;
}

export interface AIAnalysis {
  summary: string;
  feelings: string[];
  distortions: string[];
  encouragement: string;
  isCrisis: boolean;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  date: string;
  text: string;
  analysis: AIAnalysis;
}

export interface WaterLog {
  totalMl: number;
  lastLogged: number;
  history: { timestamp: number; amount: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Moodboard {
  id: string;
  name: string;
  images: string[]; // base64 strings
  timestamp: number;
}

export interface UserState {
  xp: number;
  level: number;
  moodHistory: { date: string; mood: Mood }[];
  lastCheckIn: string | null;
  lastQuestTimestamp: number;
  completedQuests: string[];
  unlockedAbilities: string[];
  journalEntries: JournalEntry[];
  waterLog: WaterLog;
  chatHistory: ChatMessage[];
  moodboards: Moodboard[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'grounding' | 'gratitude' | 'focus' | 'checkin' | 'social' | 'movement' | 'water';
}

export type View = 'home' | 'journal' | 'quests' | 'stats' | 'games' | 'moodboard';
