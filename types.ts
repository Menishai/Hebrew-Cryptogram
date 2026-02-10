
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD'
}

export enum Screen {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS',
  ACHIEVEMENTS = 'ACHIEVEMENTS'
}

export enum FontSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bestStreak: number;
  currentStreak: number;
  currentLevel: number;
  usedQuotes: { text: string; author: string; year?: string }[];
  hasCompletedTutorial: boolean; 
  perfectGames: number; 
  hintsRemaining: number; 
  // Reward counters - now tracking totals
  easyWinsCount: number;   
  mediumWinsCount: number; 
  hardWinsCount: number;   
  veryHardWinsCount: number;
  // Achievement tracking
  claimedAchievements: string[]; // List of IDs for achievements whose hint has been claimed
}

export interface GameLevel {
  quote: string;
  author: string;
  year?: string;
  mapping: Record<string, number>; 
  revealedIndices: number[]; 
  isLockChallenge?: boolean; 
}

export interface UserState {
  score: number;
  mistakes: number;
  maxMistakes: number;
  hintsRemaining: number;
  cellGuesses: Record<number, string>; 
  selectedCellIndex: number | null;
  cellFeedback: Record<number, 'correct' | 'wrong' | 'pop-active' | null>;
  currentLevel: number;
  isAuthorRevealed: boolean;
}

export enum GameStatus {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}
