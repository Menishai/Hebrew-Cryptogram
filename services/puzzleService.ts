
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

  interface DifficultyParams {
    revealMin: number;
    revealMax: number;
    lockMin: number;
    lockMax: number;
    strikes: number;
  }

  const getDifficultyParams = (wordCount: number, difficulty: Difficulty): DifficultyParams => {
    if (wordCount <= 3) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.35, revealMax: 0.42, lockMin: 0, lockMax: 0, strikes: 5 };
        case Difficulty.MEDIUM: return { revealMin: 0.29, revealMax: 0.36, lockMin: 0.03, lockMax: 0.06, strikes: 5 };
        case Difficulty.HARD: return { revealMin: 0.21, revealMax: 0.27, lockMin: 0.10, lockMax: 0.14, strikes: 3 };
        case Difficulty.VERY_HARD: return { revealMin: 0.12, revealMax: 0.19, lockMin: 0.18, lockMax: 0.25, strikes: 3 };
      }
    } else if (wordCount === 4) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.31, revealMax: 0.37, lockMin: 0, lockMax: 0, strikes: 5 };
        case Difficulty.MEDIUM: return { revealMin: 0.27, revealMax: 0.34, lockMin: 0.04, lockMax: 0.06, strikes: 5 };
        case Difficulty.HARD: return { revealMin: 0.18, revealMax: 0.25, lockMin: 0.10, lockMax: 0.13, strikes: 3 };
        case Difficulty.VERY_HARD: return { revealMin: 0.11, revealMax: 0.18, lockMin: 0.19, lockMax: 0.25, strikes: 3 };
      }
    } else if (wordCount === 5) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.29, revealMax: 0.36, lockMin: 0, lockMax: 0.03, strikes: 6 };
        case Difficulty.MEDIUM: return { revealMin: 0.25, revealMax: 0.32, lockMin: 0.06, lockMax: 0.07, strikes: 5 };
        case Difficulty.HARD: return { revealMin: 0.18, revealMax: 0.24, lockMin: 0.13, lockMax: 0.15, strikes: 3 };
        case Difficulty.VERY_HARD: return { revealMin: 0.10, revealMax: 0.18, lockMin: 0.23, lockMax: 0.27, strikes: 3 };
      }
    } else if (wordCount === 6) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.28, revealMax: 0.35, lockMin: 0, lockMax: 0.04, strikes: 6 };
        case Difficulty.MEDIUM: return { revealMin: 0.21, revealMax: 0.27, lockMin: 0.07, lockMax: 0.09, strikes: 5 };
        case Difficulty.HARD: return { revealMin: 0.14, revealMax: 0.19, lockMin: 0.15, lockMax: 0.19, strikes: 3 };
        case Difficulty.VERY_HARD: return { revealMin: 0.07, revealMax: 0.13, lockMin: 0.26, lockMax: 0.30, strikes: 3 };
      }
    } else if (wordCount === 7) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.27, revealMax: 0.33, lockMin: 0.04, lockMax: 0.06, strikes: 6 };
        case Difficulty.MEDIUM: return { revealMin: 0.19, revealMax: 0.25, lockMin: 0.09, lockMax: 0.12, strikes: 5 };
        case Difficulty.HARD: return { revealMin: 0.12, revealMax: 0.16, lockMin: 0.20, lockMax: 0.24, strikes: 3 };
        case Difficulty.VERY_HARD: return { revealMin: 0.06, revealMax: 0.11, lockMin: 0.29, lockMax: 0.34, strikes: 3 };
      }
    } else if (wordCount >= 8 && wordCount <= 12) {
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.25, revealMax: 0.31, lockMin: 0.04, lockMax: 0.07, strikes: 6 };
        case Difficulty.MEDIUM: return { revealMin: 0.17, revealMax: 0.22, lockMin: 0.10, lockMax: 0.12, strikes: 6 };
        case Difficulty.HARD: return { revealMin: 0.11, revealMax: 0.15, lockMin: 0.21, lockMax: 0.25, strikes: 4 };
        case Difficulty.VERY_HARD: return { revealMin: 0.07, revealMax: 0.11, lockMin: 0.33, lockMax: 0.40, strikes: 3 };
      }
    } else { // 13+ words
      switch (difficulty) {
        case Difficulty.EASY: return { revealMin: 0.22, revealMax: 0.28, lockMin: 0.05, lockMax: 0.08, strikes: 7 };
        case Difficulty.MEDIUM: return { revealMin: 0.14, revealMax: 0.20, lockMin: 0.12, lockMax: 0.15, strikes: 6 };
        case Difficulty.HARD: return { revealMin: 0.09, revealMax: 0.13, lockMin: 0.24, lockMax: 0.29, strikes: 4 };
        case Difficulty.VERY_HARD: return { revealMin: 0.06, revealMax: 0.09, lockMin: 0.37, lockMax: 0.43, strikes: 4 };
      }
    }
    // Fallback
    return { revealMin: 0.2, revealMax: 0.3, lockMin: 0, lockMax: 0, strikes: 5 };
  };

  const getShortSentenceProtection = (totalLetters: number, difficulty: Difficulty) => {
    if (totalLetters >= 2 && totalLetters <= 5) {
      switch (difficulty) {
        case Difficulty.EASY: return { minReveal: 2, lockOverride: 0 };
        case Difficulty.MEDIUM: return { minReveal: 2, lockOverride: 0 };
        case Difficulty.HARD: return { minReveal: 1, lockOverride: 1 };
        case Difficulty.VERY_HARD: return { minReveal: 1, lockOverride: 1 };
      }
    } else if (totalLetters >= 6 && totalLetters <= 9) {
      switch (difficulty) {
        case Difficulty.EASY: return { minReveal: 3, lockOverride: 0 };
        case Difficulty.MEDIUM: return { minReveal: 3, lockOverride: 0 };
        case Difficulty.HARD: return { minReveal: 2, lockOverride: 1 };
        case Difficulty.VERY_HARD: return { minReveal: 2, lockOverride: 1 };
      }
    } else if (totalLetters >= 10 && totalLetters <= 11) {
      switch (difficulty) {
        case Difficulty.EASY: return { minReveal: 4, lockOverride: 0 };
        case Difficulty.MEDIUM: return { minReveal: 4, lockOverride: 0 };
        case Difficulty.HARD: return { minReveal: 3, lockOverride: 1 };
        case Difficulty.VERY_HARD: return { minReveal: 2, lockOverride: 1 };
      }
    }
    return null;
  };

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
  const level = buildLevelFromQuote(selected.quote, selected.author, selected.year, difficulty, currentLevel, undefined, selected.category);
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

  const level = buildLevelFromQuote(selectedQuote.quote, selectedQuote.author, (selectedQuote as any).year, difficulty, 10, sr, (selectedQuote as any).category);
    level.isDaily = true;
    level.dailyDate = dateStr;
    return level;
  };

function buildLevelFromQuote(quote: string, author: string, year: string | undefined, difficulty: Difficulty, levelNum: number, sr?: SeededRandom, category?: QuoteCategory): GameLevel {
    const cleanQuote = quote.trim();
    const letterToNum: Record<string, number> = {};
    const uniqueLetters = new Set<string>();
    const letterPositions: number[] = [];

    // 1. Count letters (ignoring spaces/punctuation)
    let totalLetters = 0;
    for (let i = 0; i < cleanQuote.length; i++) {
      const char = cleanQuote[i];
      if (isHebrewLetter(char)) {
        uniqueLetters.add(FINAL_TO_BASE[char] || char);
        letterPositions.push(i);
        totalLetters++;
      }
    }

    // 2. Count words
    const wordCount = cleanQuote.split(/\s+/).filter(w => w.length > 0).length;

    // 3. Get difficulty parameters
    const params = getDifficultyParams(wordCount, difficulty);

      // 4. Calculate percentages
    let targetPercentReveal: number;
    
    if (levelNum <= 2) {
      targetPercentReveal = 0.53;
    } else if (levelNum === 3) {
      targetPercentReveal = 0.43;
    } else if (levelNum === 4) {
      targetPercentReveal = 0.35;
    } else {
      const randValReveal = sr ? sr.next() : Math.random();
      targetPercentReveal = randValReveal * (params.revealMax - params.revealMin) + params.revealMin;

      if (cleanQuote.length < 20) targetPercentReveal += 0.05;
      if (cleanQuote.length > 50) targetPercentReveal -= 0.02;
    }
    
    const randValLock = sr ? sr.next() : Math.random();
    const targetPercentLock = randValLock * (params.lockMax - params.lockMin) + params.lockMin;

    let targetRevealCount = Math.floor(totalLetters * targetPercentReveal);
    let targetLockCount = Math.floor(totalLetters * targetPercentLock);

    // 5. Short Sentence Protection
    let isShortSentenceProtectionActive = false;
    if (totalLetters <= 11) {
      const protection = getShortSentenceProtection(totalLetters, difficulty);
      if (protection) {
        isShortSentenceProtectionActive = true;
        targetRevealCount = Math.max(targetRevealCount, protection.minReveal);
        targetLockCount = protection.lockOverride;
      }
    }

    // Ensure we don't reveal more than total letters
    targetRevealCount = Math.min(targetRevealCount, totalLetters);
    // Ensure we don't lock more than remaining unrevealed letters
    targetLockCount = Math.min(targetLockCount, totalLetters - targetRevealCount);

    // Generate mapping
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

    // Select indices to reveal
    const shuffledPositions = [...letterPositions].sort(() => (sr ? sr.next() : Math.random()) - 0.5);
    const revealedIndices = shuffledPositions.slice(0, targetRevealCount);

    // Select indices to lock (from remaining unrevealed)
    const remainingIndices = shuffledPositions.slice(targetRevealCount);
    // Shuffle remaining again just to be sure
    const shuffledRemaining = [...remainingIndices].sort(() => (sr ? sr.next() : Math.random()) - 0.5);
    const lockedIndices = shuffledRemaining.slice(0, targetLockCount);

    return {
      quote: cleanQuote,
      author,
      year,
      category,
      mapping: letterToNum,
      revealedIndices,
      lockedIndices,
      maxMistakes: params.strikes,
      isLockChallenge: lockedIndices.length > 0 // Keep for backward compatibility if needed, but logic should use lockedIndices
    };
  }
