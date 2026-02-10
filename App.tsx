
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameLevel, UserState, GameStatus, Difficulty, Screen, Statistics, FontSize } from './types';
import { generateCryptogramPuzzle } from './services/puzzleService';
import Header from './components/Header';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import GameOverlay from './components/GameOverlay';
import MainMenu from './components/MainMenu';
import StatsScreen from './components/StatsScreen';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import TutorialOverlay from './components/TutorialOverlay';
import HintModal from './components/HintModal';
import { useGameAudio } from './hooks/useGameAudio';
import { normalizeHebrewChar, isHebrewLetter } from './utils/textUtils';

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { numRevealed: 0, maxMistakes: 5, hints: 3 },
  [Difficulty.MEDIUM]: { numRevealed: 0, maxMistakes: 5, hints: 2 },
  [Difficulty.HARD]: { numRevealed: 0, maxMistakes: 3, hints: 1 },
  [Difficulty.VERY_HARD]: { numRevealed: 0, maxMistakes: 2, hints: 1 },
};

const STORAGE_KEYS = {
  DIFFICULTY: 'cryptogram-difficulty',
  STATS: 'cryptogram-stats',
  GAME_STATE: 'cryptogram-saved-game',
  VIBRATION: 'cryptogram-vibration',
  SOUND: 'cryptogram-sound',
  FONT_SIZE: 'cryptogram-font-size',
};

const MAX_USED_QUOTES_HISTORY = 200;
const CELEBRATION_DURATION = 2000;

const checkIfCellIsLocked = (
  idx: number,
  levelData: GameLevel | null,
  currentLevel: number,
  status: GameStatus,
  guesses: Record<number, string>
): boolean => {
  if (!levelData?.isLockChallenge || status !== GameStatus.PLAYING) return false;
  if (currentLevel < 3) return false; 

  const isLetter = (i: number) => i >= 0 && i < levelData.quote.length && isHebrewLetter(levelData.quote[i]);
  const isSolved = (i: number) => {
    if (!isLetter(i)) return false;
    if (levelData.revealedIndices.includes(i)) return true;
    const guess = guesses[i];
    return !!(guess && normalizeHebrewChar(guess) === normalizeHebrewChar(levelData.quote[i]));
  };
  
  if (isSolved(idx)) return false;
  const isFirstLetterOfWord = idx === 0 || levelData.quote[idx - 1] === ' ';
  if (isFirstLetterOfWord) return false;

  let lockSpacing = 2;
  if (currentLevel >= 3 && currentLevel < 5) lockSpacing = 5;
  else if (currentLevel >= 5 && currentLevel < 10) lockSpacing = 3;
  
  if (idx % lockSpacing !== 0) return false;

  const findAdjacentLetter = (start: number, direction: number) => {
    let current = start + direction;
    while (current >= 0 && current < levelData.quote.length) {
      if (isHebrewLetter(levelData.quote[current])) return current;
      current += direction;
    }
    return -1;
  };
  
  const prevL = findAdjacentLetter(idx, -1);
  const nextL = findAdjacentLetter(idx, 1);
  
  if (prevL !== -1 && isSolved(prevL)) return false;
  if (nextL !== -1 && isSolved(nextL)) return false;
  
  return true;
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [levelData, setLevelData] = useState<GameLevel | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [celebratingWordIdx, setCelebratingWordIdx] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isHintMode, setIsHintMode] = useState(false);
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [isUndoConfirmVisible, setIsUndoConfirmVisible] = useState(false);
  const [currentLevelDifficulty, setCurrentLevelDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  
  const [history, setHistory] = useState<UserState[]>([]);
  const [preFetchedLevel, setPreFetchedLevel] = useState<{level: GameLevel, difficulty: Difficulty} | null>(null);
  const isPreFetchingRef = useRef(false);
  
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentScreen, levelData]);

  const [difficultySetting, setDifficultySetting] = useState<Difficulty | 'AUTO'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
    return (saved as Difficulty) || 'AUTO';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return (saved as FontSize) || FontSize.MEDIUM;
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIBRATION);
    return saved === null ? true : saved === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved === null ? true : saved === 'true';
  });

  const playSound = useGameAudio(soundEnabled);

  const [stats, setStats] = useState<Statistics>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    const initialStats: Statistics = { 
      gamesPlayed: 0, 
      gamesWon: 0, 
      gamesLost: 0, 
      bestStreak: 0, 
      currentStreak: 0, 
      currentLevel: 1,
      usedQuotes: [],
      hasCompletedTutorial: false,
      perfectGames: 0,
      hintsRemaining: 3, 
      easyWinsCount: 0,
      mediumWinsCount: 0,
      hardWinsCount: 0,
      veryHardWinsCount: 0,
      claimedAchievements: []
    };
    if (!saved) return initialStats;
    try {
      const parsed = JSON.parse(saved);
      return { ...initialStats, ...parsed };
    } catch {
      return initialStats;
    }
  });

  const [userState, setUserState] = useState<UserState>({
    score: 0,
    mistakes: 0,
    maxMistakes: DIFFICULTY_CONFIG[Difficulty.EASY].maxMistakes,
    hintsRemaining: stats.hintsRemaining,
    cellGuesses: {},
    selectedCellIndex: null,
    cellFeedback: {},
    currentLevel: stats.currentLevel || 1,
    isAuthorRevealed: false
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DIFFICULTY, difficultySetting); }, [difficultySetting]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VIBRATION, String(vibrationEnabled)); }, [vibrationEnabled]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled)); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);

  useEffect(() => {
    if (currentScreen === Screen.PLAYING && levelData && status === GameStatus.PLAYING) {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify({ levelData, userState, difficulty: currentLevelDifficulty }));
    }
  }, [currentScreen, levelData, userState, currentLevelDifficulty, status]);

  const hasUnclaimedAchievements = useMemo(() => {
    const milestones = [
      { id: 'streak_3', achieved: stats.bestStreak >= 3 },
      { id: 'streak_6', achieved: stats.bestStreak >= 6 },
      { id: 'streak_12', achieved: stats.bestStreak >= 12 },
      { id: 'streak_25', achieved: stats.bestStreak >= 25 },
      { id: 'level_10', achieved: stats.currentLevel >= 10 },
      { id: 'level_30', achieved: stats.currentLevel >= 30 },
      { id: 'level_60', achieved: stats.currentLevel >= 60 },
      { id: 'level_100', achieved: stats.currentLevel >= 100 },
      { id: 'perfect_1', achieved: (stats.perfectGames || 0) >= 1 },
      { id: 'perfect_10', achieved: (stats.perfectGames || 0) >= 10 },
      { id: 'perfect_25', achieved: (stats.perfectGames || 0) >= 25 },
      { id: 'perfect_50', achieved: (stats.perfectGames || 0) >= 50 },
      { id: 'total_10', achieved: stats.gamesWon >= 10 },
      { id: 'total_50', achieved: stats.gamesWon >= 50 },
    ];
    return milestones.some(m => m.achieved && !stats.claimedAchievements.includes(m.id));
  }, [stats]);

  const canRestart = useMemo(() => {
    if (!levelData) return true;
    const currentGuessesCount = Object.keys(userState.cellGuesses).length;
    return currentGuessesCount <= levelData.revealedIndices.length;
  }, [userState.cellGuesses, levelData]);

  const updateStats = useCallback((won: boolean, levelInfo: GameLevel, difficulty: Difficulty, mistakesCount: number = 0) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      
      if (won) {
        const quoteObj = { text: levelInfo.quote, author: levelInfo.author, year: levelInfo.year };
        const alreadyExists = prev.usedQuotes.some(q => q.text === quoteObj.text);
        if (!alreadyExists) {
          newStats.usedQuotes = [quoteObj, ...prev.usedQuotes].slice(0, MAX_USED_QUOTES_HISTORY);
        }

        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        newStats.currentLevel = (prev.currentLevel || 1) + 1;
        if (mistakesCount === 0) newStats.perfectGames = (prev.perfectGames || 0) + 1;

        if (difficulty === Difficulty.VERY_HARD) {
          newStats.veryHardWinsCount += 1;
          newStats.hintsRemaining += 1;
          setRewardMessage("כל הכבוד! רמה קשה מאוד - זכית ב-1 רמז!");
        } else if (difficulty === Difficulty.HARD) {
          newStats.hardWinsCount += 1;
          if (newStats.hardWinsCount % 2 === 0) {
            newStats.hintsRemaining += 1;
            setRewardMessage(`נצחון מס' ${newStats.hardWinsCount} ברמה קשה! זכית ב-1 רמז!`);
          }
        } else if (difficulty === Difficulty.MEDIUM) {
          newStats.mediumWinsCount += 1;
          if (newStats.mediumWinsCount % 5 === 0) {
            newStats.hintsRemaining += 1;
            setRewardMessage(`נצחון מס' ${newStats.mediumWinsCount} ברמה בינונית! זכית ב-1 רמז!`);
          }
        } else if (difficulty === Difficulty.EASY) {
          newStats.easyWinsCount += 1;
          if (newStats.easyWinsCount % 10 === 0) {
            newStats.hintsRemaining += 1;
            setRewardMessage(`נצחון מס' ${newStats.easyWinsCount} ברמה קלה! זכית ב-1 רמז!`);
          }
        }
      } else {
        newStats.gamesLost += 1;
        newStats.currentStreak = 0;
      }
      return newStats;
    });
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }, []);

  const handleClaimAchievement = (id: string) => {
    setStats(prev => {
      if (prev.claimedAchievements.includes(id)) return prev;
      const newHints = prev.hintsRemaining + 1;
      
      setUserState(currentU => ({ ...currentU, hintsRemaining: newHints }));
      
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.userState.hintsRemaining = newHints;
          localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(parsed));
        } catch (e) { console.error("Failed to sync claim with storage", e); }
      }

      return {
        ...prev,
        hintsRemaining: newHints,
        claimedAchievements: [...prev.claimedAchievements, id]
      };
    });
    playSound('hint');
  };

  const hasLockedCells = useMemo(() => {
    if (!levelData) return false;
    for (let i = 0; i < levelData.quote.length; i++) {
      if (isHebrewLetter(levelData.quote[i]) && checkIfCellIsLocked(i, levelData, stats.currentLevel, status, userState.cellGuesses)) {
        return true;
      }
    }
    return false;
  }, [levelData, stats.currentLevel, status, userState.cellGuesses]);

  const handleUndoRequest = useCallback(() => {
    if (history.length === 0 || status !== GameStatus.PLAYING) return;
    if (userState.hintsRemaining <= 0) {
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 500);
      return;
    }
    setIsUndoConfirmVisible(true);
  }, [history.length, status, userState.hintsRemaining]);

  const confirmUndo = useCallback(() => {
    setIsUndoConfirmVisible(false);
    if (history.length === 0 || status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    
    const lastState = history[history.length - 1];
    setHistory(prev => [...prev.slice(0, -1)]);
    
    const newHints = userState.hintsRemaining - 1;
    setUserState({ ...lastState, hintsRemaining: newHints });
    setStats(prev => ({ ...prev, hintsRemaining: newHints }));
    
    setIsHintMode(false);
    playSound('undo');
  }, [history, status, userState.hintsRemaining, playSound]);

  const handleRevealLockedOption = useCallback(() => {
    setShowHintMenu(false);
    if (!levelData || status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    
    const lockedIndices: number[] = [];
    for (let i = 0; i < levelData.quote.length; i++) {
      if (isHebrewLetter(levelData.quote[i]) && checkIfCellIsLocked(i, levelData, stats.currentLevel, status, userState.cellGuesses)) {
        lockedIndices.push(i);
      }
    }

    if (lockedIndices.length === 0) return;
    
    const randomIdx = lockedIndices[Math.floor(Math.random() * lockedIndices.length)];
    applyHintToIndex(randomIdx);
  }, [levelData, status, userState.hintsRemaining, stats.currentLevel, userState.cellGuesses]);

  const getRandomDifficulty = useCallback((level: number) => {
    if (level <= 4) {
      const options = [Difficulty.EASY, Difficulty.MEDIUM];
      return options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.VERY_HARD];
      return options[Math.floor(Math.random() * options.length)];
    }
  }, []);

  const preFetchNextLevel = useCallback(async (usedQuotes: any[], levelNum: number) => {
    if (isPreFetchingRef.current) return;
    isPreFetchingRef.current = true;
    try {
      const nextDifficulty = difficultySetting === 'AUTO' ? getRandomDifficulty(levelNum + 1) : difficultySetting;
      const config = DIFFICULTY_CONFIG[nextDifficulty];
      const excludedTexts = usedQuotes.map(q => q.text);
      const level = await generateCryptogramPuzzle(config.numRevealed, excludedTexts, nextDifficulty, levelNum + 1);
      setPreFetchedLevel({ level, difficulty: nextDifficulty });
    } catch (error) {
      console.error("Background pre-fetch failed:", error);
    } finally {
      isPreFetchingRef.current = false;
    }
  }, [difficultySetting, getRandomDifficulty]);

  useEffect(() => {
    if (!preFetchedLevel && !isPreFetchingRef.current && currentScreen === Screen.PLAYING) {
      preFetchNextLevel(stats.usedQuotes, stats.currentLevel);
    }
  }, [currentScreen, preFetchedLevel, stats.usedQuotes, stats.currentLevel, preFetchNextLevel]);

  const handleDifficultyChange = (newDiff: Difficulty | 'AUTO') => {
    setDifficultySetting(newDiff);
    setPreFetchedLevel(null);
  };

  const isCellLocked = useCallback((idx: number) => {
    return checkIfCellIsLocked(idx, levelData, stats.currentLevel, status, userState.cellGuesses);
  }, [levelData, userState.cellGuesses, status, stats.currentLevel]);

  const initLevelState = useCallback((newLevel: GameLevel, diff: Difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    const initialGuesses: Record<number, string> = {};
    newLevel.revealedIndices.forEach(idx => {
      const char = newLevel.quote[idx];
      if (char) initialGuesses[idx] = char;
    });

    setLevelData(newLevel);
    setCurrentLevelDifficulty(diff);
    setHistory([]);
    setIsHintMode(false);
    setShowHintMenu(false);
    setIsUndoConfirmVisible(false);
    setRewardMessage(null);
    
    let firstEmptyIdx = -1;
    for (let i = 0; i < newLevel.quote.length; i++) {
      const isLetter = isHebrewLetter(newLevel.quote[i]);
      const isRevealed = newLevel.revealedIndices.includes(i);
      if (isLetter && !isRevealed && !checkIfCellIsLocked(i, newLevel, stats.currentLevel, GameStatus.PLAYING, initialGuesses)) {
        firstEmptyIdx = i; break;
      }
    }

    setUserState({
      score: 0,
      mistakes: 0,
      maxMistakes: config.maxMistakes,
      hintsRemaining: stats.hintsRemaining, 
      cellGuesses: initialGuesses,
      selectedCellIndex: firstEmptyIdx === -1 ? null : firstEmptyIdx,
      cellFeedback: {},
      currentLevel: stats.currentLevel || 1,
      isAuthorRevealed: false
    });
    setStatus(GameStatus.PLAYING);
  }, [stats.currentLevel, stats.hintsRemaining]);

  const startNewGame = useCallback(async (forcedDifficulty?: Difficulty) => {
    setCurrentScreen(Screen.PLAYING);
    setCelebratingWordIdx(null);
    setIsOverlayVisible(true);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    
    if (preFetchedLevel && !forcedDifficulty) {
      const preFetched = preFetchedLevel;
      setPreFetchedLevel(null);
      initLevelState(preFetched.level, preFetched.difficulty);
      return;
    }
    
    setStatus(GameStatus.LOADING);
    try {
      const targetDiff = forcedDifficulty || (difficultySetting === 'AUTO' ? getRandomDifficulty(stats.currentLevel) : difficultySetting);
      const config = DIFFICULTY_CONFIG[targetDiff];
      const excludedTexts = stats.usedQuotes.map(q => q.text);
      const newLevel = await generateCryptogramPuzzle(config.numRevealed, excludedTexts, targetDiff, stats.currentLevel);
      initLevelState(newLevel, targetDiff);
    } catch (error) {
      console.error("Failed to load game:", error);
      setCurrentScreen(Screen.HOME);
    }
  }, [difficultySetting, stats.currentLevel, stats.usedQuotes, preFetchedLevel, initLevelState, getRandomDifficulty]);

  const handleHintClick = useCallback(() => {
    if (status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    if (isHintMode) {
      setIsHintMode(false);
    } else {
      setShowHintMenu(true);
    }
  }, [status, userState.hintsRemaining, isHintMode]);

  const handleRevealLetterOption = useCallback(() => {
    setShowHintMenu(false);
    setIsHintMode(true);
  }, []);

  const handleRevealAuthorOption = useCallback(() => {
    setShowHintMenu(false);
    if (userState.isAuthorRevealed || userState.hintsRemaining <= 0) return;
    
    playSound('hint');
    const newHints = userState.hintsRemaining - 1;
    setStats(s => ({ ...s, hintsRemaining: newHints }));
    setUserState(prev => ({
      ...prev,
      isAuthorRevealed: true,
      hintsRemaining: newHints
    }));
  }, [userState.isAuthorRevealed, userState.hintsRemaining, playSound]);

  const applyHintToIndex = useCallback((idx: number) => {
    if (!levelData || status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    const charAtSelection = levelData.quote[idx];
    if (!isHebrewLetter(charAtSelection)) { setIsBoardShaking(true); setTimeout(() => setIsBoardShaking(false), 500); return; }
    
    const currentGuess = userState.cellGuesses[idx];
    if (currentGuess && normalizeHebrewChar(currentGuess) === normalizeHebrewChar(charAtSelection)) { setIsHintMode(false); return; }
    
    playSound('hint');
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
    
    const newHints = userState.hintsRemaining - 1;
    setStats(s => ({ ...s, hintsRemaining: newHints }));
    
    setUserState(prev => {
      const newGuesses = { ...prev.cellGuesses, [idx]: levelData.quote[idx] };
      const newFeedback = { ...prev.cellFeedback, [idx]: 'pop-active' as const };
      
      const isWin = levelData.quote.split('').every((char, i) => {
        const isLetter = isHebrewLetter(char);
        if (!isLetter) return true;
        const g = newGuesses[i];
        return g && normalizeHebrewChar(g) === normalizeHebrewChar(char);
      });
      
      if (isWin) {
        setTimeout(() => {
          setStatus(GameStatus.WON);
          updateStats(true, levelData, currentLevelDifficulty, prev.mistakes);
          playSound('win');
        }, 600);
      }
      return { ...prev, hintsRemaining: newHints, cellGuesses: newGuesses, cellFeedback: newFeedback };
    });
    
    setIsHintMode(false);
    setTimeout(() => {
      setUserState(prev => {
        const updatedFeedback = { ...prev.cellFeedback };
        if (updatedFeedback[idx] === 'pop-active') updatedFeedback[idx] = 'correct';
        return { ...prev, cellFeedback: updatedFeedback };
      });
    }, 1000);
  }, [levelData, status, userState.hintsRemaining, userState.cellGuesses, playSound, updateStats, vibrationEnabled, currentLevelDifficulty]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setStats(prev => ({ ...prev, hasCompletedTutorial: true }));
  };

  const continueGame = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (saved) {
      try {
        const { levelData: savedLevel, userState: savedUserState, difficulty: savedDiff } = JSON.parse(saved);
        setLevelData(savedLevel);
        setUserState(savedUserState);
        setCurrentLevelDifficulty(savedDiff);
        setHistory([]);
        setCurrentScreen(Screen.PLAYING);
        setStatus(GameStatus.PLAYING);
        setIsOverlayVisible(true);
        setIsHintMode(false);
        setShowHintMenu(false);
        setIsUndoConfirmVisible(false);
        setRewardMessage(null);
      } catch (e) { localStorage.removeItem(STORAGE_KEYS.GAME_STATE); }
    }
  }, []);

  const revealSolution = useCallback(() => {
    if (!levelData) return;
    setUserState(prev => {
      const newGuesses = { ...prev.cellGuesses };
      const newFeedback = { ...prev.cellFeedback };
      for (let i = 0; i < levelData.quote.length; i++) {
        const char = levelData.quote[i];
        if (isHebrewLetter(char)) { newGuesses[i] = char; newFeedback[i] = 'correct'; }
      }
      return { ...prev, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: null, isAuthorRevealed: true };
    });
    setIsOverlayVisible(false);
    setIsHintMode(false);
  }, [levelData]);

  const charIdxToWordIdx = useMemo(() => {
    if (!levelData) return [];
    const mapping: number[] = [];
    const words = levelData.quote.split(' ');
    let globalIdx = 0;
    words.forEach((word, wordIdx) => {
      for (let i = 0; i < word.length; i++) mapping[globalIdx + i] = wordIdx;
      globalIdx += word.length + 1;
    });
    return mapping;
  }, [levelData]);

  const foundLetters = useMemo(() => {
    if (!levelData) return new Set<string>();
    const found = new Set<string>();
    (Object.entries(userState.cellGuesses) as [string, string][]).forEach(([idxStr, guess]) => {
      const idx = parseInt(idxStr);
      if (guess && isHebrewLetter(guess) && normalizeHebrewChar(guess) === normalizeHebrewChar(levelData.quote[idx])) {
        found.add(normalizeHebrewChar(guess));
      }
    });
    return found;
  }, [levelData, userState.cellGuesses]);

  const completedLetters = useMemo(() => {
    if (!levelData) return new Set<string>();
    const mapping: Record<string, number[]> = {};
    for(let i=0; i<levelData.quote.length; i++) {
      const char = levelData.quote[i];
      if(isHebrewLetter(char)) {
        const base = normalizeHebrewChar(char);
        if(!mapping[base]) mapping[base] = [];
        mapping[base].push(i);
      }
    }
    const completed = new Set<string>();
    Object.entries(mapping).forEach(([base, indices]) => {
      const allCorrect = indices.every(idx => {
        const g = userState.cellGuesses[idx];
        return g && normalizeHebrewChar(g) === normalizeHebrewChar(levelData.quote[idx]);
      });
      if(allCorrect) completed.add(base);
    });
    return completed;
  }, [levelData, userState.cellGuesses]);

  const handleKeyPress = (letter: string) => {
    if (status !== GameStatus.PLAYING || userState.selectedCellIndex === null || !levelData || isHintMode) return;
    const idx = userState.selectedCellIndex;
    if (isCellLocked(idx)) { playSound('locked'); setIsBoardShaking(true); setTimeout(() => setIsBoardShaking(false), 400); return; }
    
    if (levelData.revealedIndices.includes(idx)) return;
    
    setHistory(prev => [...prev, userState]);
    const correctChar = levelData.quote[idx];
    
    if (normalizeHebrewChar(correctChar) === normalizeHebrewChar(letter)) {
      setUserState(prev => {
        const newGuesses = { ...prev.cellGuesses, [idx]: levelData.quote[idx] };
        const newFeedback = { ...prev.cellFeedback, [idx]: 'pop-active' as const };
        
        const wordIdx = charIdxToWordIdx[idx];
        let isWordJustCompleted = false;
        if (wordIdx !== undefined) {
          const words = levelData.quote.split(' ');
          let startIdx = 0;
          for(let i=0; i<wordIdx; i++) startIdx += words[i].length + 1;
          const wordIndices = Array.from({length: words[wordIdx].length}, (_, i) => startIdx + i);
          isWordJustCompleted = wordIndices.every(i => {
            const charAtPos = levelData.quote[i];
            if (!isHebrewLetter(charAtPos)) return true;
            const g = newGuesses[i];
            return g && normalizeHebrewChar(g) === normalizeHebrewChar(charAtPos);
          });
        }
        
        if (isWordJustCompleted) { 
          setCelebratingWordIdx(wordIdx); 
          playSound('letter-complete'); 
          setTimeout(() => setCelebratingWordIdx(null), CELEBRATION_DURATION); 
        } else {
          playSound('correct');
        }

        const isWin = levelData.quote.split('').every((char, i) => {
          const isLetter = isHebrewLetter(char);
          if (!isLetter) return true;
          const g = newGuesses[i];
          return g && normalizeHebrewChar(g) === normalizeHebrewChar(char);
        });

        if (isWin) { 
          setStatus(GameStatus.WON); 
          updateStats(true, levelData, currentLevelDifficulty, prev.mistakes); 
          playSound('win'); 
        }

        let nextIdx: number | null = null;
        for (let i = idx + 1; i < levelData.quote.length; i++) {
          const locked = checkIfCellIsLocked(i, levelData, stats.currentLevel, status, newGuesses);
          if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i] && !locked) { 
            nextIdx = i; break; 
          }
        }
        if (nextIdx === null) {
          for (let i = 0; i < idx; i++) {
            const locked = checkIfCellIsLocked(i, levelData, stats.currentLevel, status, newGuesses);
            if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i] && !locked) { 
              nextIdx = i; break; 
            }
          }
        }
        
        return { ...prev, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: nextIdx };
      });

      setTimeout(() => {
        setUserState(prev => {
          const updatedFeedback = { ...prev.cellFeedback };
          if (updatedFeedback[idx] === 'pop-active') updatedFeedback[idx] = 'correct';
          return { ...prev, cellFeedback: updatedFeedback };
        });
      }, 1000);
    } else {
      playSound('wrong');
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setUserState(prev => {
        const newMistakes = prev.mistakes + 1;
        const newFeedback = { ...prev.cellFeedback, [idx]: 'wrong' as const };
        if (newMistakes >= prev.maxMistakes) { setStatus(GameStatus.LOST); updateStats(false, levelData, currentLevelDifficulty); }
        return { ...prev, mistakes: newMistakes, cellFeedback: newFeedback, cellGuesses: { ...prev.cellGuesses, [idx]: letter } };
      });
      setTimeout(() => {
        setUserState(prev => {
          const { [idx]: _, ...remainingGuesses } = prev.cellGuesses;
          const { [idx]: __, ...remainingFeedback } = prev.cellFeedback;
          return { ...prev, cellGuesses: remainingGuesses, cellFeedback: remainingFeedback };
        });
      }, 400);
    }
  };

  const handleCellClick = (idx: number) => {
    if (status !== GameStatus.PLAYING) return;
    if (isCellLocked(idx)) { playSound('locked'); setIsBoardShaking(true); setTimeout(() => setIsBoardShaking(false), 400); return; }
    if (isHintMode) applyHintToIndex(idx);
    else setUserState(prev => ({ ...prev, selectedCellIndex: idx }));
  };

  const hasSavedGame = !!localStorage.getItem(STORAGE_KEYS.GAME_STATE);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden relative select-none" dir="rtl">
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
      
      {showHintMenu && (
        <HintModal 
          onRevealLetter={handleRevealLetterOption} 
          onRevealAuthor={handleRevealAuthorOption} 
          onRevealLocked={handleRevealLockedOption}
          onCancel={() => setShowHintMenu(false)}
          isAuthorRevealed={userState.isAuthorRevealed}
          hintsRemaining={userState.hintsRemaining}
          hasLockedCells={hasLockedCells}
        />
      )}

      {isUndoConfirmVisible && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40" dir="rtl">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className="fa-solid fa-arrow-rotate-left"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">ביטול פעולה</h3>
            <p className="text-slate-500 font-medium mb-8">ביטול פעולה יעלה ב-1 רמז. האם אתה בטוח?</p>
            <div className="flex gap-4">
              <button 
                onClick={confirmUndo}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                כן, בטל
              </button>
              <button 
                onClick={() => setIsUndoConfirmVisible(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 active:scale-95 transition-all"
              >
                חזור
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentScreen === Screen.HOME ? (
        <MainMenu onNewGame={() => startNewGame()} onContinue={continueGame} hasSavedGame={hasSavedGame} onStats={() => setCurrentScreen(Screen.STATS)} onSettings={() => setCurrentScreen(Screen.SETTINGS)} onAchievements={() => setCurrentScreen(Screen.ACHIEVEMENTS)} onShowTutorial={() => setShowTutorial(true)} currentLevel={stats.currentLevel || 1} hasUnclaimedAchievements={hasUnclaimedAchievements} />
      ) : currentScreen === Screen.STATS ? (
        <StatsScreen stats={stats} onBack={() => setCurrentScreen(Screen.HOME)} />
      ) : currentScreen === Screen.SETTINGS ? (
        <SettingsScreen difficulty={difficultySetting} onDifficultyChange={handleDifficultyChange} fontSize={fontSize} onFontSizeChange={(f) => setFontSize(f)} vibrationEnabled={vibrationEnabled} onVibrationToggle={() => setVibrationEnabled(!vibrationEnabled)} soundEnabled={soundEnabled} onSoundToggle={() => setSoundEnabled(!soundEnabled)} onBack={() => setCurrentScreen(Screen.HOME)} />
      ) : currentScreen === Screen.ACHIEVEMENTS ? (
        <AchievementsScreen stats={stats} onBack={() => setCurrentScreen(Screen.HOME)} onClaim={handleClaimAchievement} />
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <Header mistakes={userState.mistakes} maxMistakes={userState.maxMistakes} hintsRemaining={userState.hintsRemaining} onUseHint={handleHintClick} isHintModeActive={isHintMode} onUndo={handleUndoRequest} canUndo={history.length > 0} onRestart={() => startNewGame()} onHome={() => setCurrentScreen(Screen.HOME)} onShowTutorial={() => setShowTutorial(true)} currentLevel={stats.currentLevel || 1} difficulty={currentLevelDifficulty} canRestart={canRestart} hasUnclaimedAchievements={hasUnclaimedAchievements} />
          <main 
            ref={mainScrollRef}
            className={`flex-1 overflow-y-auto px-2 py-4 md:px-6 md:py-8 max-w-4xl mx-auto w-full flex flex-col items-center ${isBoardShaking ? 'animate-shake' : ''}`}
          >
            {status === GameStatus.LOADING ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium text-center">מכין את הפאזל הבא...</p>
              </div>
            ) : (
              <Board level={levelData!} userState={userState} fontSize={fontSize} isHintMode={isHintMode} onSelect={handleCellClick} completedLetters={completedLetters} celebratingWordIdx={celebratingWordIdx} isCellLocked={isCellLocked} />
            )}
            {!isOverlayVisible && (status === GameStatus.WON || status === GameStatus.LOST) && (
              <div className="mt-8 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-500 pb-8">
                <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-sm">הפתרון נחשף בלוח!</div>
                <button onClick={() => startNewGame()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>{status === GameStatus.WON ? 'לשלב הבא' : 'נסה שוב'}</span>
                </button>
              </div>
            )}
          </main>
          <div className="pb-8 px-2 flex-shrink-0">
            <Keyboard onPress={handleKeyPress} disabled={status !== GameStatus.PLAYING || isHintMode} completedLetters={completedLetters} foundLetters={foundLetters} />
          </div>
          {status === GameStatus.WON && isOverlayVisible && (
            <GameOverlay title="כל הכבוד!" message={`סיימת את שלב ${stats.currentLevel - 1}!`} type="won" onAction={() => startNewGame()} onReveal={revealSolution} quote={levelData?.quote} author={levelData?.author} year={levelData?.year} showRevealButton={false} bonusMessage={rewardMessage} />
          )}
          {status === GameStatus.LOST && isOverlayVisible && (
            <GameOverlay title="המשחק נגמר" message="עשית יותר מדי טעויות. נסה שוב!" type="lost" onAction={() => startNewGame()} onReveal={revealSolution} author={levelData?.author} showRevealButton={true} />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
