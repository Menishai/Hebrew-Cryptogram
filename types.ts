
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
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  DAILY_QUIZ = 'DAILY_QUIZ'
}

export enum FontSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export type QuoteCategory = 'proverb' | 'song' | 'source' | 'famous' | 'sports' | 'cinema';

export interface DailyDayStats {
  status: 'won' | 'lost' | 'none';
  attempts: number;
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
  // Total Reward counters (for Stats page - including Daily)
  easyWinsCount: number;   
  mediumWinsCount: number; 
  hardWinsCount: number;   
  veryHardWinsCount: number;
  // Career Achievement Tracking (Excluding Daily)
  careerWins: number;
  careerPerfectGames: number;
  careerHardWins: number;
  careerVeryHardWins: number;
  careerBestStreak: number;
  // Achievement tracking
  claimedAchievements: string[];
  // Advanced tracking
  totalMistakes: number;
  // Purchases
  isAdFree?: boolean;
  isSkipAnytimePurchased?: boolean;
  isSportsPackPurchased?: boolean;
  isCinemaPackPurchased?: boolean;
  // Daily Quiz Tracking: Record<"YYYY-MM-DD", DailyDayStats>
  dailyProgress?: Record<string, DailyDayStats>;
  rewardedDailyWeeks?: string[];
}

export interface GameLevel {
  quote: string;
  author: string;
  year?: string;
  mapping: Record<string, number>; 
  revealedIndices: number[]; 
  lockedIndices: number[];
  maxMistakes: number;
  isLockChallenge?: boolean; 
  isDaily?: boolean;
  dailyDate?: string;
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
  hintRevealedIndices: number[]; // Tracks which letters were solved via hints
}

export enum GameStatus {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}
