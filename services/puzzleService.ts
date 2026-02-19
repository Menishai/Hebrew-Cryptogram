
import { GameLevel, Difficulty, QuoteCategory } from "../types";
import { QUOTES_DB } from "../data/quotes";
import { SPECIAL_DAILY_QUOTES } from "../data/dailyQuotes";
import { FINAL_TO_BASE, isHebrewLetter } from "../utils/textUtils";

/**
 * A simple seeded random generator to ensure everyone gets the same puzzle.
 */
class SeededRandom {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    this.seed = hash;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export const generateCryptogramPuzzle = async (
  _requestedNumToReveal: number = 2, 
  excludedQuotes: string[] = [], 
  difficulty: Difficulty = Difficulty.MEDIUM, 
  currentLevel: number = 1,
  activeCategories: QuoteCategory[] = ['proverb', 'song', 'source', 'famous']
): Promise<GameLevel> => {
  const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');
  const normalizedExcluded = new Set(excludedQuotes.map(normalizeText));
  const categorySet = new Set(activeCategories);
  
  let pool = QUOTES_DB.filter(q => q.difficulty === difficulty && categorySet.has(q.category));
  if (pool.length === 0 && activeCategories.length === 0) {
    pool = QUOTES_DB.filter(q => q.difficulty === difficulty);
  }

  let unplayed = pool.filter(q => !normalizedExcluded.has(normalizeText(q.quote)));
  let wasCategoryExhausted = false;

  if (unplayed.length === 0) {
    wasCategoryExhausted = true;
    let globalPool = QUOTES_DB.filter(q => q.difficulty === difficulty);
    unplayed = globalPool.filter(q => !normalizedExcluded.has(normalizeText(q.quote)));
    if (unplayed.length === 0) {
      const lastPlayedText = excludedQuotes.length > 0 ? normalizeText(excludedQuotes[0]) : null;
      unplayed = globalPool.filter(q => normalizeText(q.quote) !== lastPlayedText);
      if (unplayed.length === 0) unplayed = globalPool;
    }
  }

  const selected = unplayed[Math.floor(Math.random() * unplayed.length)];
  const level = buildLevelFromQuote(selected.quote, selected.author, selected.year, difficulty, currentLevel);
  (level as any).wasCategoryExhausted = wasCategoryExhausted;
  return level;
};

export const generateDailyPuzzle = async (dateStr: string): Promise<GameLevel> => {
  const sr = new SeededRandom(dateStr);
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Difficulty increases through the week
  let difficulty = Difficulty.MEDIUM;
  if (dayOfWeek === 0) difficulty = Difficulty.EASY;
  else if (dayOfWeek === 3 || dayOfWeek === 4) difficulty = Difficulty.HARD;
  else if (dayOfWeek === 5 || dayOfWeek === 6) difficulty = Difficulty.VERY_HARD;

  let selectedQuote;
  
  // Rule: Strictly use the daily database. 
  // If the specific date is missing, pick deterministically from the daily pool only.
  if (SPECIAL_DAILY_QUOTES[dateStr]) {
    selectedQuote = SPECIAL_DAILY_QUOTES[dateStr];
  } else {
    const dailyPool = Object.values(SPECIAL_DAILY_QUOTES);
    const index = Math.floor(sr.next() * dailyPool.length);
    selectedQuote = dailyPool[index];
  }

  const level = buildLevelFromQuote(selectedQuote.quote, selectedQuote.author, (selectedQuote as any).year, difficulty, 10, sr);
  level.isDaily = true;
  level.dailyDate = dateStr;
  return level;
};

function buildLevelFromQuote(quote: string, author: string, year: string | undefined, difficulty: Difficulty, levelNum: number, sr?: SeededRandom): GameLevel {
  const cleanQuote = quote.trim();
  const letterToNum: Record<string, number> = {};
  const uniqueLetters = new Set<string>();
  const letterPositions: number[] = [];

  for (let i = 0; i < cleanQuote.length; i++) {
    const char = cleanQuote[i];
    if (isHebrewLetter(char)) {
      uniqueLetters.add(FINAL_TO_BASE[char] || char);
      letterPositions.push(i);
    }
  }

  const numbers = Array.from({ length: 22 }, (_, i) => i + 1);
  const shuffle = (arr: any[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((sr ? sr.next() : Math.random()) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };
  shuffle(numbers);

  const baseLetterArray = Array.from(uniqueLetters);
  baseLetterArray.forEach((letter, index) => {
    letterToNum[letter] = numbers[index % 22];
  });

  Object.entries(FINAL_TO_BASE).forEach(([final, base]) => {
    if (letterToNum[base]) letterToNum[final] = letterToNum[base];
  });

  const PERCENTAGES = {
    [Difficulty.EASY]: { min: 0.25, max: 0.35 },
    [Difficulty.MEDIUM]: { min: 0.14, max: 0.18 }, 
    [Difficulty.HARD]: { min: 0.04, max: 0.10 },
    [Difficulty.VERY_HARD]: { min: 0.0, max: 0.03 }
  };

  const range = PERCENTAGES[difficulty];
  const randVal = sr ? sr.next() : Math.random();
  let targetPercent = randVal * (range.max - range.min) + range.min;

  if (cleanQuote.length < 20) targetPercent += 0.05;
  if (cleanQuote.length > 50) targetPercent -= 0.02;

  let targetRevealCount = Math.floor(letterPositions.length * targetPercent);
  if (difficulty !== Difficulty.HARD && difficulty !== Difficulty.VERY_HARD) targetRevealCount = Math.max(targetRevealCount, 1);

  const shuffledPositions = [...letterPositions].sort(() => (sr ? sr.next() : Math.random()) - 0.5);
  const revealedIndices = shuffledPositions.slice(0, targetRevealCount);

  let isLockChallenge = false;
  if (levelNum >= 3) {
    let prob = levelNum < 5 ? 0.3 : (levelNum < 10 ? 0.6 : 0.85);
    if (difficulty === Difficulty.HARD) prob += 0.15;
    if (difficulty === Difficulty.VERY_HARD) prob += 0.3;
    isLockChallenge = (sr ? sr.next() : Math.random()) < prob && cleanQuote.length > 15;
  }

  return {
    quote: cleanQuote,
    author,
    year,
    mapping: letterToNum,
    revealedIndices,
    isLockChallenge
  };
}
