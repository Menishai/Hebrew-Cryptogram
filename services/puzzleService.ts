
import { GameLevel, Difficulty } from "../types";
import { QUOTES_DB } from "../data/quotes";
import { FINAL_TO_BASE, isHebrewLetter } from "../utils/textUtils";

/**
 * Generates a cryptogram puzzle by selecting a quote from the local database.
 * Uses position-based revelation with exact percentage ranges.
 */
export const generateCryptogramPuzzle = async (
  _requestedNumToReveal: number = 2, 
  excludedQuotes: string[] = [], 
  difficulty: Difficulty = Difficulty.MEDIUM, 
  currentLevel: number = 1
): Promise<GameLevel> => {
  
  // Normalize string for comparison (remove extra spaces)
  const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

  // 1. Filter database and prevent immediate repeats
  const normalizedExcluded = new Set(excludedQuotes.map(normalizeText));
  
  let pool = QUOTES_DB.filter(q => q.difficulty === difficulty);
  
  // Strict filtering: remove any quote that matches the excluded list
  let unplayed = pool.filter(q => !normalizedExcluded.has(normalizeText(q.quote)));
  
  // If we ran out of new quotes, reset the pool but try to avoid the VERY LAST played one
  if (unplayed.length === 0) {
    const lastPlayedText = excludedQuotes.length > 0 ? normalizeText(excludedQuotes[0]) : null;
    unplayed = pool.filter(q => normalizeText(q.quote) !== lastPlayedText);
    
    // If still empty (e.g. pool size is 1), just use the pool
    if (unplayed.length === 0) {
      unplayed = pool;
    }
  }

  // 2. Pick a random quote from filtered pool
  const selected = unplayed[Math.floor(Math.random() * unplayed.length)];
  const cleanQuote = selected.quote.trim();

  // 3. Mapping Logic
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
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const baseLetterArray = Array.from(uniqueLetters);
  baseLetterArray.forEach((letter, index) => {
    letterToNum[letter] = numbers[index % 22];
  });

  Object.entries(FINAL_TO_BASE).forEach(([final, base]) => {
    if (letterToNum[base]) {
      letterToNum[final] = letterToNum[base];
    }
  });

  // 4. Dynamic Revelation (Position-Based)
  const totalPositions = letterPositions.length;
  
  const PERCENTAGES = {
    [Difficulty.EASY]: { min: 0.25, max: 0.35 },
    [Difficulty.MEDIUM]: { min: 0.14, max: 0.18 }, 
    [Difficulty.HARD]: { min: 0.04, max: 0.10 },
    [Difficulty.VERY_HARD]: { min: 0.0, max: 0.03 }
  };

  const range = PERCENTAGES[difficulty];
  let targetPercent = Math.random() * (range.max - range.min) + range.min;

  if (cleanQuote.length < 20) targetPercent += 0.05;
  if (cleanQuote.length > 50) targetPercent -= 0.02;

  let targetRevealCount = Math.floor(totalPositions * targetPercent);

  // Boost initial levels
  if (currentLevel === 1) targetRevealCount = Math.max(targetRevealCount, Math.floor(totalPositions * 0.45));
  if (currentLevel === 2) targetRevealCount = Math.max(targetRevealCount, Math.floor(totalPositions * 0.35));

  if (difficulty !== Difficulty.HARD && difficulty !== Difficulty.VERY_HARD) {
    targetRevealCount = Math.max(targetRevealCount, 1);
  }

  const shuffledPositions = [...letterPositions].sort(() => Math.random() - 0.5);
  const revealedIndices = shuffledPositions.slice(0, targetRevealCount);

  // 5. Gradual Lock Challenge Logic
  let isLockChallenge = false;
  if (currentLevel >= 3) {
    let prob = 0;
    if (currentLevel < 5) {
      prob = 0.3; // Low chance for levels 3-4
    } else if (currentLevel < 10) {
      prob = 0.6; // Higher chance for levels 5-9
    } else {
      prob = 0.85; // Very high for 10+
    }
    
    // Harder modes are always more likely to have locks
    if (difficulty === Difficulty.HARD) prob += 0.15;
    if (difficulty === Difficulty.VERY_HARD) prob += 0.3;
    
    isLockChallenge = Math.random() < prob && cleanQuote.length > 15;
  }

  return {
    quote: cleanQuote,
    author: selected.author,
    year: selected.year,
    mapping: letterToNum,
    revealedIndices,
    isLockChallenge
  };
};
