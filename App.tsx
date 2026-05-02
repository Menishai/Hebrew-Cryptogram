import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameLevel, UserState, GameStatus, Difficulty, Screen, Statistics, FontSize, QuoteCategory, DailyDayStats } from './types';
import { generateCryptogramPuzzle, generateDailyPuzzle } from './services/puzzleService';
import { generateSolitairePuzzle } from './services/solitairePuzzleService';
import Header from './components/Header';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import GameOverlay from './components/GameOverlay';
import MainMenu from './components/MainMenu';
import StatsScreen from './components/StatsScreen';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import DailyQuizCalendar from './components/DailyQuizCalendar';
import TutorialOverlay from './components/TutorialOverlay';
import HintModal from './components/HintModal';
import ShopModal from './components/ShopModal';
import SplashScreen from './components/SplashScreen';
import SolitaireGameMode from './components/SolitaireGameMode';
import { useGameAudio } from './hooks/useGameAudio';
import { normalizeHebrewChar, isHebrewLetter, isEventTime } from './utils/textUtils';
import { motion, AnimatePresence } from "framer-motion";
import { useBilling } from './hooks/useBilling';
import { useRewardedAd } from './hooks/useRewardedAd';

const APP_VERSION = '1.65';

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { numRevealed: 0, maxMistakes: 5, hints: 3 },
  [Difficulty.MEDIUM]: { numRevealed: 0, maxMistakes: 5, hints: 2 },
  [Difficulty.HARD]: { numRevealed: 0, maxMistakes: 3, hints: 1 },
  [Difficulty.VERY_HARD]: { numRevealed: 0, maxMistakes: 3, hints: 1 },
};

const STORAGE_KEYS = {
  DIFFICULTY: 'cryptogram-difficulty',
  STATS: 'cryptogram-stats',
  GAME_STATE: 'cryptogram-saved-game',
  VIBRATION: 'cryptogram-vibration',
  SOUND: 'cryptogram-sound',
  FONT_SIZE: 'cryptogram-font-size',
  LAST_SCREEN: 'cryptogram-last-screen',
  ACTIVE_CATEGORIES: 'cryptogram-active-categories',
};

const MAX_USED_QUOTES_HISTORY = 1000;
const CELEBRATION_DURATION = 2000;
const IDLE_HINT_THRESHOLD = 12000; // 12 seconds

const checkIfCellIsLocked = (
  idx: number,
  levelData: GameLevel | null,
  currentLevel: number,
  status: GameStatus,
  guesses: Record<number, string>,
  hintRevealedIndices: number[] = []
): boolean => {
  if (!levelData || status !== GameStatus.PLAYING) return false;
  
  if (!levelData.lockedIndices || !levelData.lockedIndices.includes(idx)) {
    if (levelData.isLockChallenge && !levelData.lockedIndices) {
       return false; 
    }
    return false;
  }

  const isLetter = (i: number) => i >= 0 && i < levelData.quote.length && isHebrewLetter(levelData.quote[i]);
  
  const isSolvedNormally = (i: number) => {
    if (!isLetter(i)) return false;
    const isCorrect = !!(guesses[i] && normalizeHebrewChar(guesses[i]) === normalizeHebrewChar(levelData.quote[i]));
    return isCorrect && !hintRevealedIndices.includes(i);
  };

  const isSolvedAtAll = (i: number) => {
    if (!isLetter(i)) return false;
    return !!(guesses[i] && normalizeHebrewChar(guesses[i]) === normalizeHebrewChar(levelData.quote[i]));
  };
  
  if (isSolvedAtAll(idx)) return false;
  
  const findAdjacentLetter = (start: number, direction: number) => {
    let current = start + direction;
    while (current >= 0 && current < levelData.quote.length) {
      if (isLetter(current)) return current;
      current += direction;
    }
    return -1;
  };
  
  const prevL = findAdjacentLetter(idx, -1);
  const nextL = findAdjacentLetter(idx, 1);
  const neighbors = [prevL, nextL].filter(n => n !== -1);

  if (neighbors.length === 0) return false;
  
  if (neighbors.some(n => isSolvedNormally(n))) return false;

  return true;
};

const App: React.FC = () => {

  const { isPremium, hasSkipForever, hasSport, hasCinema } = useBilling();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [levelData, setLevelData] = useState<GameLevel | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [celebratingWordIdx, setCelebratingWordIdx] = useState<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isHintMode, setIsHintMode] = useState(false);
  const [isLockedHintMode, setIsLockedHintMode] = useState(false);
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [isUndoConfirmVisible, setIsUndoConfirmVisible] = useState(false);
  const [currentLevelDifficulty, setCurrentLevelDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [reportToast, setReportToast] = useState(false);
  const [rewardToast, setRewardToast] = useState(false);
  const [packExhaustedToast, setPackExhaustedToast] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  
  const [history, setHistory] = useState<UserState[]>([]);
  const [preFetchedLevel, setPreFetchedLevel] = useState<{level: GameLevel, difficulty: Difficulty} | null>(null);
  const isPreFetchingRef = useRef(false);
  
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentScreen, levelData]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (status === GameStatus.PLAYING && currentScreen === Screen.PLAYING) {
      idleTimerRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, IDLE_HINT_THRESHOLD);
    }
  }, [status, currentScreen]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const [isSplashVisible, setIsSplashVisible] = useState(true);
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

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cryptogram-notifications');
    return saved === 'true';
  });

  const [notificationTime, setNotificationTime] = useState<string>(() => {
    const saved = localStorage.getItem('cryptogram-notification-time');
    return saved || '10:30';
  });

  const [activeCategories, setActiveCategories] = useState<QuoteCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORIES);
    if (!saved) return ['proverb', 'song', 'source', 'famous'];
    try {
      return JSON.parse(saved);
    } catch {
      return ['proverb', 'song', 'source', 'famous'];
    }
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
      careerWins: 0,
      careerPerfectGames: 0,
      careerHardWins: 0,
      careerVeryHardWins: 0,
      careerBestStreak: 0,
      claimedAchievements: [],
      totalMistakes: 0,
      isAdFree: false,
      isSkipAnytimePurchased: false,
      isSportsPackPurchased: false,
      isCinemaPackPurchased: false,
      dailyProgress: {}
    };
    if (!saved) return initialStats;
    try {
      const parsed = JSON.parse(saved);
      return { 
        ...initialStats, 
        ...parsed,
        hintsRemaining: parsed.hintsRemaining !== undefined ? parsed.hintsRemaining : initialStats.hintsRemaining,
        currentLevel: parsed.currentLevel || 1,
        perfectGames: parsed.perfectGames || 0,
        usedQuotes: Array.isArray(parsed.usedQuotes) ? parsed.usedQuotes : [],
        claimedAchievements: Array.isArray(parsed.claimedAchievements) ? parsed.claimedAchievements : [],
        totalMistakes: parsed.totalMistakes || 0,
        isAdFree: !!parsed.isAdFree,
        isSkipAnytimePurchased: !!parsed.isSkipAnytimePurchased,
        isSportsPackPurchased: !!parsed.isSportsPackPurchased,
        isCinemaPackPurchased: !!parsed.isCinemaPackPurchased,
        dailyProgress: parsed.dailyProgress || {},
        decodedLettersStats: parsed.decodedLettersStats || {} // <--- Loading the letters stat!
      };
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
    isAuthorRevealed: false,
    hintRevealedIndices: [],
    hintsUsedThisLevel: 0
  });

  const persistStatsTimeout = useRef<NodeJS.Timeout | null>(null);
  const persistGameStateTimeout = useRef<NodeJS.Timeout | null>(null);

  const persistStats = useCallback((newStats: Statistics) => {
    if (persistStatsTimeout.current) clearTimeout(persistStatsTimeout.current);
    persistStatsTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    }, 500);
  }, []);

  const persistGameState = useCallback((data: { levelData: GameLevel, userState: UserState, difficulty: Difficulty, history: UserState[] }) => {
    if (persistGameStateTimeout.current) clearTimeout(persistGameStateTimeout.current);
    persistGameStateTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data));
    }, 500);
  }, []);

  const handleRewardEarned = useCallback(() => {
    setShowHintMenu(false); 
    setUserState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining + 1
    }));
    setStats(prev => {
      const newStats = { ...prev, hintsRemaining: prev.hintsRemaining + 1 };
      if (typeof persistStats === 'function') {
        persistStats(newStats); 
      }
      return newStats;
    });
    setTimeout(() => {
      setRewardToast(true);
      playSound('win');
      setTimeout(() => setRewardToast(false), 3500); 
    }, 500);
  }, [playSound]);

  const { isAdReady, showAd } = useRewardedAd(handleRewardEarned);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DIFFICULTY, difficultySetting); }, [difficultySetting]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VIBRATION, String(vibrationEnabled)); }, [vibrationEnabled]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled)); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LAST_SCREEN, currentScreen); }, [currentScreen]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORIES, JSON.stringify(activeCategories)); }, [activeCategories]);
  
  useEffect(() => {
    localStorage.setItem('cryptogram-notifications', String(notificationsEnabled));
    localStorage.setItem('cryptogram-notification-time', notificationTime);
    import('./utils/notifications').then(({ setupDailyNotification }) => {
      setupDailyNotification(notificationsEnabled, notificationTime);
    });
  }, [notificationsEnabled, notificationTime]);
  
  useEffect(() => { persistStats(stats); }, [stats]);

  useEffect(() => {
    if (currentScreen === Screen.PLAYING && levelData && status === GameStatus.PLAYING) {
      persistGameState({ levelData, userState, difficulty: currentLevelDifficulty, history });
    }
  }, [currentScreen, levelData, userState, currentLevelDifficulty, status, history]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    const lastScreen = localStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
    if (saved && (lastScreen === Screen.PLAYING)) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.levelData && parsed.userState) {
          setLevelData(parsed.levelData);
          setUserState({
            ...parsed.userState,
            hintsRemaining: stats.hintsRemaining
          });
          setCurrentLevelDifficulty(parsed.difficulty);
          setHistory(parsed.history || []);
          setCurrentScreen(Screen.PLAYING);
          setStatus(GameStatus.PLAYING);
        }
      } catch (e) {
        console.error("Auto-resume failed", e);
      }
    }
  }, []);

  const handlePurchaseHints = (amount: number) => {
    setStats(prev => {
      const newStats = { ...prev, hintsRemaining: prev.hintsRemaining + amount };
      persistStats(newStats);
      return newStats;
    });
    setUserState(prev => ({ ...prev, hintsRemaining: prev.hintsRemaining + amount }));
    playSound('hint');
  };

  const handlePurchaseRemoveAds = () => {
    setStats(prev => {
      const newStats = { ...prev, isAdFree: true };
      persistStats(newStats);
      return newStats;
    });
    playSound('win');
  };

  const handlePurchaseSkipAnytime = () => {
    setStats(prev => {
      const newStats = { ...prev, isSkipAnytimePurchased: true };
      persistStats(newStats);
      return newStats;
    });
    playSound('win');
  };

  const handlePurchaseSportsPack = () => {
    setStats(prev => {
      const newStats = { ...prev, isSportsPackPurchased: true };
      persistStats(newStats);
      return newStats;
    });
    if (!activeCategories.includes('sports')) {
      setActiveCategories(prev => [...prev, 'sports']);
      setPreFetchedLevel(null);
    }
    playSound('win');
  };

  const handlePurchaseCinemaPack = () => {
    setStats(prev => {
      const newStats = { ...prev, isCinemaPackPurchased: true };
      persistStats(newStats);
      return newStats;
    });
    if (!activeCategories.includes('cinema')) {
      setActiveCategories(prev => [...prev, 'cinema']);
      setPreFetchedLevel(null);
    }
    playSound('win');
  };

  const handlePurchaseBundle = () => {
    setStats(prev => {
      const newStats = { 
        ...prev, 
        isAdFree: true, 
        isSkipAnytimePurchased: true, 
        isSportsPackPurchased: true, 
        isCinemaPackPurchased: true,
        hintsRemaining: prev.hintsRemaining + 300
      };
      persistStats(newStats);
      return newStats;
    });
    setUserState(prev => ({ ...prev, hintsRemaining: prev.hintsRemaining + 300 }));
    
    setActiveCategories(prev => {
      const newCats = [...prev];
      if (!newCats.includes('sports')) newCats.push('sports');
      if (!newCats.includes('cinema')) newCats.push('cinema');
      return newCats;
    });
    setPreFetchedLevel(null);
    playSound('win');
  };

  const handleImportData = useCallback((data: any) => {
    if (!data || !data.stats) return;
    setStats(data.stats);
    persistStats(data.stats);
    if (data.difficulty) setDifficultySetting(data.difficulty);
    if (data.fontSize) setFontSize(data.fontSize);
    setVibrationEnabled(data.vibrationEnabled ?? true);
    setSoundEnabled(data.soundEnabled ?? true);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    window.location.reload();
  }, []);

  const handleReportMistake = useCallback(() => {
    const email = "meniapps.help@gmail.com";
    const subject = encodeURIComponent("דיווח על טעות באלוף הצופן");
    let body = "שלום צוות אלוף הצופן,\n\nמצאתי טעות בציטוט הבא:\n\n";
    
    if (levelData) {
      body += `ציטוט: "${levelData.quote}"\n`;
      body += `מחבר: ${levelData.author}\n`;
      body += `רמת קושי: ${currentLevelDifficulty}\n`;
      body += `שלב: ${stats.currentLevel}\n`;
    }
    
    body += "\nפירוט הטעות:\n";
    
    window.location.href = `mailto:meniapps.help@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
    setReportToast(true);
    setTimeout(() => setReportToast(false), 3000);
  }, [levelData, currentLevelDifficulty, stats.currentLevel]);

  const hasUnclaimedAchievements = useMemo(() => {
    const uniqueAuthorsCount = new Set(stats.usedQuotes.map(q => q.author)).size;
    const challengeWins = (stats.careerHardWins || 0) + (stats.careerVeryHardWins || 0);
    
    const milestones = [
      { id: 'streak_3', achieved: stats.careerBestStreak >= 3 },
      { id: 'streak_7', achieved: stats.careerBestStreak >= 7 },
      { id: 'streak_15', achieved: stats.careerBestStreak >= 15 },
      { id: 'streak_30', achieved: stats.careerBestStreak >= 30 },
      { id: 'streak_50', achieved: stats.careerBestStreak >= 50 },
            
      { id: 'daily_streak_3', achieved: (stats.bestDailyStreak || 0) >= 3 },
      { id: 'daily_streak_7', achieved: (stats.bestDailyStreak || 0) >= 7 },
      { id: 'daily_streak_14', achieved: (stats.bestDailyStreak || 0) >= 14 },
      { id: 'daily_streak_30', achieved: (stats.bestDailyStreak || 0) >= 30 },
      
      { id: 'no_hints_10', achieved: (stats.winsWithoutHints || 0) >= 10 },
      { id: 'no_hints_20', achieved: (stats.winsWithoutHints || 0) >= 20 },
      { id: 'no_hints_50', achieved: (stats.winsWithoutHints || 0) >= 50 },
      { id: 'no_hints_100', achieved: (stats.winsWithoutHints || 0) >= 100 },
      
      { id: 'marathon_5', achieved: (stats.bestMarathon || 0) >= 5 },
      { id: 'marathon_10', achieved: (stats.bestMarathon || 0) >= 10 },
      { id: 'marathon_20', achieved: (stats.bestMarathon || 0) >= 20 },
      
      { id: 'level_10', achieved: (stats.currentLevel - 1) >= 10 },
      { id: 'level_25', achieved: (stats.currentLevel - 1) >= 25 },
      { id: 'level_50', achieved: (stats.currentLevel - 1) >= 50 },
      { id: 'level_100', achieved: (stats.currentLevel - 1) >= 100 },
      { id: 'level_250', achieved: (stats.currentLevel - 1) >= 250 },

      { id: 'perfect_1', achieved: (stats.careerPerfectGames || 0) >= 1 },
      { id: 'perfect_5', achieved: (stats.careerPerfectGames || 0) >= 5 },
      { id: 'perfect_20', achieved: (stats.careerPerfectGames || 0) >= 20 },
      { id: 'perfect_50', achieved: (stats.careerPerfectGames || 0) >= 50 },
      { id: 'perfect_100', achieved: (stats.careerPerfectGames || 0) >= 100 },

      { id: 'total_10', achieved: stats.careerWins >= 10 },
      { id: 'total_25', achieved: stats.careerWins >= 25 },
      { id: 'total_50', achieved: stats.careerWins >= 50 },
      { id: 'total_100', achieved: stats.careerWins >= 100 },
      { id: 'total_250', achieved: stats.careerWins >= 250 },

      { id: 'diff_5', achieved: challengeWins >= 5 },
      { id: 'diff_15', achieved: challengeWins >= 15 },
      { id: 'diff_30', achieved: challengeWins >= 30 },
      { id: 'diff_60', achieved: challengeWins >= 60 },

      { id: 'coll_5', achieved: uniqueAuthorsCount >= 5 },
      { id: 'coll_15', achieved: uniqueAuthorsCount >= 15 },
      { id: 'coll_40', achieved: uniqueAuthorsCount >= 40 },
      { id: 'coll_80', achieved: uniqueAuthorsCount >= 80 },

      { id: 'genre_proverb_10', achieved: (stats.winsByCategory?.['proverb'] || 0) >= 10 },
      { id: 'genre_proverb_25', achieved: (stats.winsByCategory?.['proverb'] || 0) >= 25 },
      { id: 'genre_proverb_50', achieved: (stats.winsByCategory?.['proverb'] || 0) >= 50 },
      
      { id: 'genre_song_10', achieved: (stats.winsByCategory?.['song'] || 0) >= 10 },
      { id: 'genre_song_25', achieved: (stats.winsByCategory?.['song'] || 0) >= 25 },
      { id: 'genre_song_50', achieved: (stats.winsByCategory?.['song'] || 0) >= 50 },
      
      { id: 'genre_source_10', achieved: (stats.winsByCategory?.['source'] || 0) >= 10 },
      { id: 'genre_source_25', achieved: (stats.winsByCategory?.['source'] || 0) >= 25 },
      { id: 'genre_source_50', achieved: (stats.winsByCategory?.['source'] || 0) >= 50 },
      
      { id: 'genre_famous_10', achieved: (stats.winsByCategory?.['famous'] || 0) >= 10 },
      { id: 'genre_famous_25', achieved: (stats.winsByCategory?.['famous'] || 0) >= 25 },
      { id: 'genre_famous_50', achieved: (stats.winsByCategory?.['famous'] || 0) >= 50 },
      
      { id: 'genre_sports_10', achieved: (stats.winsByCategory?.['sports'] || 0) >= 10 },
      { id: 'genre_sports_25', achieved: (stats.winsByCategory?.['sports'] || 0) >= 25 },
      { id: 'genre_sports_50', achieved: (stats.winsByCategory?.['sports'] || 0) >= 50 },
      
      { id: 'genre_cinema_10', achieved: (stats.winsByCategory?.['cinema'] || 0) >= 10 },
      { id: 'genre_cinema_25', achieved: (stats.winsByCategory?.['cinema'] || 0) >= 25 },
      { id: 'genre_cinema_50', achieved: (stats.winsByCategory?.['cinema'] || 0) >= 50 },
    ];
    return milestones.some(m => m.achieved && !stats.claimedAchievements.includes(m.id));
  }, [stats]);

  const canRestart = useMemo(() => {
    if (levelData?.isDaily) return false;
    if (stats.isSkipAnytimePurchased) return true;
    if (!levelData) return true;
    const currentGuessesCount = Object.keys(userState.cellGuesses).length;
    return currentGuessesCount <= levelData.revealedIndices.length;
  }, [userState.cellGuesses, levelData, stats.isSkipAnytimePurchased]);

  const isDailyRetryAllowed = useMemo(() => {
    if (!levelData?.isDaily || !levelData.dailyDate) return true;
    const dayStats = stats.dailyProgress?.[levelData.dailyDate];
    const todayStr = new Date().toISOString().split('T')[0];
    const isOldAttempt = dayStats && dayStats.status !== 'won' && 
                         ((dayStats.lastAttemptDate && dayStats.lastAttemptDate !== todayStr) || 
                          (!dayStats.lastAttemptDate && levelData.dailyDate !== todayStr));
    return !dayStats || isOldAttempt || dayStats.attempts < 3;  
  }, [levelData, stats.dailyProgress]);

  const dailyAttemptsLeft = useMemo(() => {
    if (!levelData?.isDaily || !levelData.dailyDate) return 0;
    const dayStats = stats.dailyProgress?.[levelData.dailyDate];
    const todayStr = new Date().toISOString().split('T')[0];
    const isOldAttempt = dayStats && dayStats.status !== 'won' && 
                         ((dayStats.lastAttemptDate && dayStats.lastAttemptDate !== todayStr) || 
                          (!dayStats.lastAttemptDate && levelData.dailyDate !== todayStr));
    const used = isOldAttempt ? 0 : (dayStats?.attempts || 0);    
    return Math.max(0, 3 - used);
  }, [levelData, stats.dailyProgress]);

  const updateStats = useCallback((won: boolean, levelInfo: GameLevel, difficulty: Difficulty, mistakesCount: number = 0, hintsUsedThisLevel: number = 0, hintsByTypeThisLevel?: { letter: number, author: number, locked: number }) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      newStats.totalMistakes += mistakesCount;
            
      newStats.totalHintsUsed = (newStats.totalHintsUsed || 0) + hintsUsedThisLevel;
      if (hintsByTypeThisLevel) {
        const hbt = { ...(newStats.hintsByType || { letter: 0, author: 0, locked: 0 }) };
        hbt.letter = (hbt.letter || 0) + hintsByTypeThisLevel.letter;
        hbt.author = (hbt.author || 0) + hintsByTypeThisLevel.author;
        hbt.locked = (hbt.locked || 0) + hintsByTypeThisLevel.locked;
        newStats.hintsByType = hbt;
      }
      
      const isDaily = !!levelInfo.isDaily;
      const todayStr = new Date().toISOString().split('T')[0];

      if (isDaily && levelInfo.dailyDate) {
        const dp = { ...(newStats.dailyProgress || {}) };
        const dayStats = dp[levelInfo.dailyDate] || { status: 'none', attempts: 0 };
                
        const isOldAttempt = dayStats.status !== 'won' && 
                             ((dayStats.lastAttemptDate && dayStats.lastAttemptDate !== todayStr) || 
                              (!dayStats.lastAttemptDate && levelInfo.dailyDate !== todayStr));
                              
        if (isOldAttempt) {
          dayStats.attempts = 0;
          dayStats.status = 'none';
        }
        
        dayStats.attempts += 1;
        dayStats.lastAttemptDate = todayStr;
        
        if (won) dayStats.status = 'won';
        else if (dayStats.attempts >= 3) dayStats.status = 'lost';

        dp[levelInfo.dailyDate] = dayStats;
        newStats.dailyProgress = dp;
      }

      if (won) {
        // --- NEW LOGIC: Record Letters for Stats ---
        const updatedDecodedLetters = { ...(newStats.decodedLettersStats || {}) };
        for (const char of levelInfo.quote) {
          if (isHebrewLetter(char)) {
            const normalizedChar = normalizeHebrewChar(char);
            updatedDecodedLetters[normalizedChar] = (updatedDecodedLetters[normalizedChar] || 0) + 1;
          }
        }
        newStats.decodedLettersStats = updatedDecodedLetters;
        // ------------------------------------------

        const quoteObj = { text: levelInfo.quote, author: levelInfo.author, year: levelInfo.year, category: levelInfo.category };
        const alreadyExists = prev.usedQuotes.some(q => q.text === quoteObj.text);
        if (!alreadyExists) {
          newStats.usedQuotes = [quoteObj, ...prev.usedQuotes].slice(0, MAX_USED_QUOTES_HISTORY);
        }

        newStats.gamesWon += 1;
        if (mistakesCount === 0) newStats.perfectGames += 1;
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        
        if (newStats.lastPlayedDate === todayStr) {
          newStats.gamesWonToday = (newStats.gamesWonToday || 0) + 1;
        } else {
          newStats.lastPlayedDate = todayStr;
          newStats.gamesWonToday = 1;
        }
        newStats.bestMarathon = Math.max(newStats.bestMarathon || 0, newStats.gamesWonToday);

        if (hintsUsedThisLevel === 0) {
          newStats.winsWithoutHints = (newStats.winsWithoutHints || 0) + 1;
        }

        if (levelInfo.category) {
          newStats.winsByCategory = {
            ...(newStats.winsByCategory || {}),
            [levelInfo.category]: (newStats.winsByCategory?.[levelInfo.category] || 0) + 1
          };
        }

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

        if (isDaily && levelInfo.dailyDate) {
          if (newStats.lastDailyWinDate) {
            const lastWin = new Date(newStats.lastDailyWinDate);
            const currentWin = new Date(levelInfo.dailyDate);
            const diffTime = Math.abs(currentWin.getTime() - lastWin.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStats.currentDailyStreak = (newStats.currentDailyStreak || 0) + 1;
            } else if (diffDays > 1) {
              newStats.currentDailyStreak = 1;
            }
          } else {
            newStats.currentDailyStreak = 1;
          }
          newStats.lastDailyWinDate = levelInfo.dailyDate;
          newStats.bestDailyStreak = Math.max(newStats.bestDailyStreak || 0, newStats.currentDailyStreak);

          const [yearStr, monthStr, dayStr] = levelInfo.dailyDate.split('-');
          const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
          const dayOfWeek = dateObj.getDay();
          const sunday = new Date(dateObj);
          sunday.setDate(dateObj.getDate() - dayOfWeek);
          const weekStartStr = `${sunday.getFullYear()}-${(sunday.getMonth()+1).toString().padStart(2, '0')}-${sunday.getDate().toString().padStart(2, '0')}`;
          
          let allWon = true;
          for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            const dStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            if (!newStats.dailyProgress || !newStats.dailyProgress[dStr] || newStats.dailyProgress[dStr].status !== 'won') {
              allWon = false;
              break;
            }
          }
          
          if (allWon) {
            const rewardedWeeks = newStats.rewardedDailyWeeks || [];
            if (!rewardedWeeks.includes(weekStartStr)) {
              newStats.rewardedDailyWeeks = [...rewardedWeeks, weekStartStr];
              newStats.hintsRemaining += 2;
              setRewardMessage(prevMsg => prevMsg ? `${prevMsg}\nבנוסף, השלמת שבוע שלם בחידון היומי! זכית ב-2 רמזים נוספים!` : "השלמת שבוע שלם בחידון היומי! זכית ב-2 רמזים!");
            }
          }
        }

        if (!isDaily) {
          newStats.careerWins += 1;
          newStats.currentLevel = (prev.currentLevel || 1) + 1;
          if (mistakesCount === 0) newStats.careerPerfectGames = (prev.careerPerfectGames || 0) + 1;
          
          if (difficulty === Difficulty.HARD) newStats.careerHardWins = (prev.careerHardWins || 0) + 1;
          if (difficulty === Difficulty.VERY_HARD) newStats.careerVeryHardWins = (prev.careerVeryHardWins || 0) + 1;
          
          newStats.careerBestStreak = Math.max(newStats.careerBestStreak || 0, newStats.currentStreak);
        }
      } else {
        newStats.gamesLost += 1;
        newStats.currentStreak = 0;
      }
      persistStats(newStats);
      return newStats;
    });
    
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }, [persistStats]);

  const handleClaimAchievement = (id: string) => {
    setStats(prev => {
      if (prev.claimedAchievements.includes(id)) return prev;
      const newHints = prev.hintsRemaining + 1;
      
      const updatedStats = {
        ...prev,
        hintsRemaining: newHints,
        claimedAchievements: [...prev.claimedAchievements, id]
      };
      
      setUserState(currentU => ({ ...currentU, hintsRemaining: newHints }));
      persistStats(updatedStats);
      
      return updatedStats;
    });
    playSound('hint');
  };

  const hasLockedCells = useMemo(() => {
    if (!levelData) return false;
    for (let i = 0; i < levelData.quote.length; i++) {
      if (isHebrewLetter(levelData.quote[i]) && checkIfCellIsLocked(i, levelData, stats.currentLevel, status, userState.cellGuesses, userState.hintRevealedIndices)) {
        return true;
      }
    }
    return false;
  }, [levelData, stats.currentLevel, status, userState.cellGuesses, userState.hintRevealedIndices]);

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
    const newState = { ...lastState, hintsRemaining: newHints };
    
    setUserState(newState);
    setStats(prev => {
      const u = { ...prev, hintsRemaining: newHints };
      persistStats(u);
      return u;
    });
    
    setIsHintMode(false);
    setIsLockedHintMode(false);
    playSound('undo');
    resetIdleTimer();
  }, [history, status, userState.hintsRemaining, playSound, resetIdleTimer, persistStats]);

  const handleRevealLockedOption = useCallback(() => {
    setShowHintMenu(false);
    if (!levelData || status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    setIsLockedHintMode(true);
    setIsHintMode(false);
  }, [levelData, status, userState.hintsRemaining]);

  const getRandomDifficulty = useCallback((level: number) => {
    if (level <= 2) return Difficulty.EASY;
    if (level === 3) return Difficulty.MEDIUM;
    if (level === 4) return Difficulty.HARD;

    const options = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.VERY_HARD];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  const preFetchNextLevel = useCallback(async (usedQuotes: any[], levelNum: number) => {
    if (isPreFetchingRef.current) return;
    isPreFetchingRef.current = true;
    try {
      let nextDifficulty = difficultySetting === 'AUTO' ? getRandomDifficulty(levelNum + 1) : difficultySetting;
      
      const nextLevelNum = levelNum + 1;
      if (nextLevelNum <= 2) nextDifficulty = Difficulty.EASY;
      else if (nextLevelNum === 3) nextDifficulty = Difficulty.MEDIUM;
      else if (nextLevelNum === 4) nextDifficulty = Difficulty.HARD;

      const config = DIFFICULTY_CONFIG[nextDifficulty];
      const excludedTexts = usedQuotes.map(q => q.text);
      const level = await generateCryptogramPuzzle(config.numRevealed, excludedTexts, nextDifficulty, levelNum + 1, activeCategories);
      setPreFetchedLevel({ level, difficulty: nextDifficulty });
    } catch (error) {
      console.error("Background pre-fetch failed:", error);
    } finally {
      isPreFetchingRef.current = false;
    }
  }, [difficultySetting, getRandomDifficulty, activeCategories]);

  useEffect(() => {
    if (!preFetchedLevel && !isPreFetchingRef.current && currentScreen === Screen.PLAYING && !levelData?.isDaily) {
      preFetchNextLevel(stats.usedQuotes, stats.currentLevel);
    }
  }, [currentScreen, preFetchedLevel, stats.usedQuotes, stats.currentLevel, preFetchNextLevel, levelData]);

  const handleDifficultyChange = (newDiff: Difficulty | 'AUTO') => {
    setDifficultySetting(newDiff);
    setPreFetchedLevel(null);
  };

  const isCellLocked = useCallback((idx: number) => {
    return checkIfCellIsLocked(idx, levelData, stats.currentLevel, status, userState.cellGuesses, userState.hintRevealedIndices);
  }, [levelData, userState.cellGuesses, status, stats.currentLevel, userState.hintRevealedIndices]);

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
    setIsLockedHintMode(false);
    setShowHintMenu(false);
    setIsUndoConfirmVisible(false);
    setRewardMessage(null);
    
    let firstEmptyIdx = -1;
    for (let i = 0; i < newLevel.quote.length; i++) {
      const isLetter = isHebrewLetter(newLevel.quote[i]);
      const isRevealed = newLevel.revealedIndices.includes(i);
      if (isLetter && !isRevealed && !checkIfCellIsLocked(i, newLevel, stats.currentLevel, GameStatus.PLAYING, initialGuesses, [])) {
        firstEmptyIdx = i; break;
      }
    }

    const initialUserState: UserState = {
      score: 0,
      mistakes: 0,
      maxMistakes: newLevel.maxMistakes || config.maxMistakes,
      hintsRemaining: stats.hintsRemaining, 
      cellGuesses: initialGuesses,
      selectedCellIndex: firstEmptyIdx === -1 ? null : firstEmptyIdx,
      cellFeedback: {},
      currentLevel: stats.currentLevel || 1,
      isAuthorRevealed: false,
      hintRevealedIndices: [],
      hintsUsedThisLevel: 0,
      hintsByTypeThisLevel: {
        letter: 0,
        author: 0,
        locked: 0
      }    };

    setUserState(initialUserState);
    setStatus(GameStatus.PLAYING);
    
    persistGameState({ levelData: newLevel, userState: initialUserState, difficulty: diff, history: [] });

    if ((newLevel as any).wasCategoryExhausted) {
      setPackExhaustedToast(true);
      setTimeout(() => setPackExhaustedToast(false), 5500);
    }
    resetIdleTimer();
  }, [stats.currentLevel, stats.hintsRemaining, resetIdleTimer, persistGameState]);

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
      let targetDiff = forcedDifficulty || (difficultySetting === 'AUTO' ? getRandomDifficulty(stats.currentLevel) : difficultySetting);
      
      if (stats.currentLevel <= 2) targetDiff = Difficulty.EASY;
      else if (stats.currentLevel === 3) targetDiff = Difficulty.MEDIUM;
      else if (stats.currentLevel === 4) targetDiff = Difficulty.HARD;

      const config = DIFFICULTY_CONFIG[targetDiff];
      const excludedTexts = stats.usedQuotes.map(q => q.text);
      const newLevel = await generateCryptogramPuzzle(config.numRevealed, excludedTexts, targetDiff, stats.currentLevel, activeCategories);
      initLevelState(newLevel, targetDiff);
    } catch (error) {
      console.error("Failed to load game:", error);
      setCurrentScreen(Screen.HOME);
    }
  }, [difficultySetting, stats.currentLevel, stats.usedQuotes, preFetchedLevel, initLevelState, getRandomDifficulty, activeCategories]);

  const startDailyGame = useCallback(async (dateStr: string) => {
    const dayStats = stats.dailyProgress?.[dateStr];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const isLockedToday = dayStats && 
                          dayStats.attempts >= 3 && 
                          dayStats.status !== 'won' && 
                          (dayStats.lastAttemptDate === todayStr || (!dayStats.lastAttemptDate && dateStr === todayStr));
                          
    if (isLockedToday) {      
      setCurrentScreen(Screen.DAILY_QUIZ);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.levelData?.isDaily && parsed.levelData?.dailyDate === dateStr) {
          const syncedUserState = {
            ...parsed.userState,
            hintsRemaining: stats.hintsRemaining
          };
          setLevelData(parsed.levelData);
          setUserState(syncedUserState);
          setCurrentLevelDifficulty(parsed.difficulty || 'AUTO');
          setHistory(parsed.history || []);
          setStatus(GameStatus.PLAYING);
          setCurrentScreen(Screen.PLAYING);
          return;
        }
      } catch (e) {
      }
    }

    setCurrentScreen(Screen.PLAYING);
    setCelebratingWordIdx(null);
    setIsOverlayVisible(true);
    setStatus(GameStatus.LOADING);
    try {
      const level = await generateDailyPuzzle(dateStr);
      let diff = Difficulty.MEDIUM;
      const d = new Date(dateStr);
      if (d.getDay() === 0) diff = Difficulty.EASY;
      else if (d.getDay() === 3 || d.getDay() === 4) diff = Difficulty.HARD;
      else if (d.getDay() === 5 || d.getDay() === 6) diff = Difficulty.VERY_HARD;

      initLevelState(level, diff);
    } catch (e) {
      setCurrentScreen(Screen.DAILY_QUIZ);
    }
  }, [initLevelState, stats.dailyProgress, stats.hintsRemaining]);

  const handleRetryLevel = useCallback(() => {
    if (!levelData) return;
    
    if (levelData.isDaily && !isDailyRetryAllowed) {
      setCurrentScreen(Screen.DAILY_QUIZ);
      return;
    }

    setCelebratingWordIdx(null);
    setIsOverlayVisible(true);
    initLevelState(levelData, currentLevelDifficulty);
  }, [levelData, currentLevelDifficulty, initLevelState, isDailyRetryAllowed]);

  const handleHintClick = useCallback(() => {
    if (status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    if (isHintMode || isLockedHintMode) {
      setIsHintMode(false);
      setIsLockedHintMode(false);
    } else {
      setShowHintMenu(true);
    }
  }, [status, userState.hintsRemaining, isHintMode, isLockedHintMode]);

  const handleRevealLetterOption = useCallback(() => {
    setShowHintMenu(false);
    setIsHintMode(true);
    setIsLockedHintMode(false);
  }, []);

  const handleRevealAuthorOption = useCallback(() => {
    setShowHintMenu(false);
    if (userState.isAuthorRevealed || userState.hintsRemaining <= 0) return;
    
    playSound('hint');
    const newHints = userState.hintsRemaining - 1;
    
    setStats(s => {
      const n = { ...s, hintsRemaining: newHints };
      persistStats(n);
      return n;
    });
    setUserState(prev => ({
      ...prev,
      hintsRemaining: newHints,
      isAuthorRevealed: true,
      hintsUsedThisLevel: (prev.hintsUsedThisLevel || 0) + 1,
      hintsByTypeThisLevel: {
        ...(prev.hintsByTypeThisLevel || { letter: 0, author: 0, locked: 0 }),
        author: (prev.hintsByTypeThisLevel?.author || 0) + 1
      }    
    }));

    setTimeout(() => {
      setShowAuthorModal(true);
    }, 50);
    
    resetIdleTimer();
  }, [userState.isAuthorRevealed, userState.hintsRemaining, playSound, resetIdleTimer, persistStats]);

  const applyHintToIndex = useCallback((idx: number, isFromLockedMenu = false) => {
    if (!levelData || status !== GameStatus.PLAYING || userState.hintsRemaining <= 0) return;
    
    const charAtSelection = levelData.quote[idx];
    if (!isHebrewLetter(charAtSelection)) { 
      setIsBoardShaking(true); 
      setTimeout(() => setIsBoardShaking(false), 500); 
      return; 
    }

    const cellLocked = isCellLocked(idx);

    if (isLockedHintMode) {
       if (!cellLocked) {
          setIsBoardShaking(true);
          setTimeout(() => setIsBoardShaking(false), 400);
          return;
       }
    } else if (cellLocked) {
      playSound('locked');
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 400);
      setIsHintMode(false); 
      return;
    }
    
    const currentGuess = userState.cellGuesses[idx];
    if (currentGuess && normalizeHebrewChar(currentGuess) === normalizeHebrewChar(charAtSelection)) { 
      setIsHintMode(false); 
      setIsLockedHintMode(false);
      return; 
    }
    
    playSound('hint');
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
    
    const newHints = userState.hintsRemaining - 1;
    setStats(s => {
      const n = { ...s, hintsRemaining: newHints };
      persistStats(n);
      return n;
    });
    
    const newGuesses = { ...userState.cellGuesses, [idx]: levelData.quote[idx] };
    const newFeedback = { ...userState.cellFeedback, [idx]: 'pop-active' as const };
    const newHintRevealed = [...userState.hintRevealedIndices, idx];
    
    const isWin = levelData.quote.split('').every((char, i) => {
      const isLetter = isHebrewLetter(char);
      if (!isLetter) return true;
      const g = newGuesses[i];
      return g && normalizeHebrewChar(g) === normalizeHebrewChar(char);
    });
    
    if (isWin) {
      setTimeout(() => {
        setStatus(GameStatus.WON);
        updateStats(true, levelData, currentLevelDifficulty, userState.mistakes, userState.hintsUsedThisLevel);
        playSound('win');
      }, 300);
    }
    
    setUserState(prev => ({ 
      ...prev, 
      hintsRemaining: newHints, 
      cellGuesses: newGuesses, 
      cellFeedback: newFeedback, 
      hintRevealedIndices: newHintRevealed,
      hintsUsedThisLevel: (prev.hintsUsedThisLevel || 0) + 1,
      hintsByTypeThisLevel: {
        ...(prev.hintsByTypeThisLevel || { letter: 0, author: 0, locked: 0 }),
        [isLockedHintMode ? 'locked' : 'letter']: (prev.hintsByTypeThisLevel?.[isLockedHintMode ? 'locked' : 'letter'] || 0) + 1
      }    
    }));

    setIsHintMode(false);
    setIsLockedHintMode(false);
    setTimeout(() => {
      setUserState(prev => {
        const updatedFeedback = { ...prev.cellFeedback };
        if (updatedFeedback[idx] === 'pop-active') updatedFeedback[idx] = 'correct';
        return { ...prev, cellFeedback: updatedFeedback };
      });
    }, 1000);
    resetIdleTimer();
  }, [levelData, status, userState, playSound, updateStats, vibrationEnabled, currentLevelDifficulty, isCellLocked, isLockedHintMode, resetIdleTimer, persistStats]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setStats(prev => {
      const n = { ...prev, hasCompletedTutorial: true };
      persistStats(n);
      return n;
    });
  };

  const continueGame = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (saved) {
      try {
        const { levelData: savedLevel, userState: savedUserState, difficulty: savedDiff, history: savedHistory } = JSON.parse(saved);
        const syncedUserState = {
          ...savedUserState,
          hintsRemaining: stats.hintsRemaining
        };
        setLevelData(savedLevel);
        setUserState(syncedUserState);
        setCurrentLevelDifficulty(savedDiff);
        setHistory(savedHistory || []);
        setCurrentScreen(Screen.PLAYING);
        setStatus(GameStatus.PLAYING);
        setIsOverlayVisible(true);
        setIsHintMode(false);
        setIsLockedHintMode(false);
        setShowHintMenu(false);
        setIsUndoConfirmVisible(false);
        setRewardMessage(null);
        resetIdleTimer();
      } catch (e) { localStorage.removeItem(STORAGE_KEYS.GAME_STATE); }
    }
  }, [stats.hintsRemaining, resetIdleTimer]);

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
    setIsLockedHintMode(false);
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
    if (status !== GameStatus.PLAYING || userState.selectedCellIndex === null || !levelData || isHintMode || isLockedHintMode) return;
    const idx = userState.selectedCellIndex;
    if (isCellLocked(idx)) { playSound('locked'); setIsBoardShaking(true); setTimeout(() => setIsBoardShaking(false), 400); return; }
    
    if (levelData.revealedIndices.includes(idx)) return;
    
    const correctChar = levelData.quote[idx];
    
    if (normalizeHebrewChar(correctChar) === normalizeHebrewChar(letter)) {
      setHistory(prev => [...prev, userState]);
      
      const newGuesses = { ...userState.cellGuesses, [idx]: levelData.quote[idx] };
      const newFeedback = { ...userState.cellFeedback, [idx]: 'pop-active' as const };
      
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
        setTimeout(() => {
          setStatus(GameStatus.WON); 
          updateStats(true, levelData, currentLevelDifficulty, userState.mistakes, userState.hintsUsedThisLevel, userState.hintsByTypeThisLevel); 
          playSound('win'); 
        }, 300);
        
        setUserState(prev => ({ ...prev, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: null }));
      } else {
        let nextIdx: number | null = null;
        for (let i = idx + 1; i < levelData.quote.length; i++) {
          const locked = checkIfCellIsLocked(i, levelData, stats.currentLevel, status, newGuesses, userState.hintRevealedIndices);
          if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i] && !locked) { 
            nextIdx = i; break; 
          }
        }
        if (nextIdx === null) {
          for (let i = 0; i < idx; i++) {
            const locked = checkIfCellIsLocked(i, levelData, stats.currentLevel, status, newGuesses, userState.hintRevealedIndices);
            if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i] && !locked) { 
              nextIdx = i; break; 
            }
          }
        }
        
        setUserState(prev => ({ ...prev, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: nextIdx }));

        setTimeout(() => {
          setUserState(prev => {
            const updatedFeedback = { ...prev.cellFeedback };
            if (updatedFeedback[idx] === 'pop-active') updatedFeedback[idx] = 'correct';
            return { ...prev, cellFeedback: updatedFeedback };
          });
        }, 1000);
      }
      resetIdleTimer();
    } else {
      playSound('wrong');
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setUserState(prev => {
        const newMistakes = prev.mistakes + 1;
        const newFeedback = { ...prev.cellFeedback, [idx]: 'wrong' as const };
        if (newMistakes >= prev.maxMistakes) { 
          setStatus(GameStatus.LOST); 
          updateStats(false, levelData, currentLevelDifficulty, newMistakes, prev.hintsUsedThisLevel, prev.hintsByTypeThisLevel); 
        }
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
    if (isHintMode) applyHintToIndex(idx);
    else if (isLockedHintMode) applyHintToIndex(idx);
    else {
      if (isCellLocked(idx)) { playSound('locked'); setIsBoardShaking(true); setTimeout(() => setIsBoardShaking(false), 400); return; }
      setUserState(prev => ({ ...prev, selectedCellIndex: idx }));
    }
  };

  const handleActiveCategoriesChange = (cats: QuoteCategory[]) => {
    setActiveCategories(cats);
    setPreFetchedLevel(null);
  };
  
  useEffect(() => {
    if (currentScreen === Screen.SOLITAIRE) {
      if (levelData && !levelData.id?.startsWith('solitaire-')) {
        setLevelData(null);
        return;
      }

      if (!levelData) {
        setStatus(GameStatus.LOADING);
        try {
          const nextIndex = stats.solitaireQuoteIndex || 0;
          const newLevel = generateSolitairePuzzle(Difficulty.MEDIUM, nextIndex);
          setLevelData(newLevel);
          initLevelState(newLevel, Difficulty.MEDIUM);
          setStatus(GameStatus.PLAYING);
        } catch (error) {
          console.error("Failed to initialize Solitaire game:", error);
          setCurrentScreen(Screen.HOME);
          setStatus(GameStatus.PLAYING);
        }
      }
    }
  }, [currentScreen, levelData, initLevelState, stats.solitaireQuoteIndex]);

  const startSolitaireGame = useCallback(() => {
    setStatus(GameStatus.LOADING);
    setCurrentScreen(Screen.SOLITAIRE);
    
      try {
      const newLevel = generateSolitairePuzzle(Difficulty.MEDIUM);
      setLevelData(newLevel);
      initLevelState(newLevel, Difficulty.MEDIUM);
      setStatus(GameStatus.PLAYING);
        } catch (error) {
        console.error("Failed to start Solitaire game:", error);
        setCurrentScreen(Screen.HOME);
      }
  }, [initLevelState]);

  const handleGameOverAction = () => {
    if (levelData?.isDaily) {
      setCurrentScreen(Screen.DAILY_QUIZ);
    } else if (levelData?.id?.startsWith('solitaire-')) {
      startSolitaireGame();
    } else {
      startNewGame();
    }
  };

  const hasSavedGame = currentScreen === Screen.HOME ? !!localStorage.getItem(STORAGE_KEYS.GAME_STATE) : false;

  return (
<div 
  className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden relative select-none" dir="rtl" style={{ paddingTop: 'max(env(safe-area-inset-top), 35px)' }}>
        <AnimatePresence mode="wait">
        {isSplashVisible ? (
          <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full w-full absolute inset-0"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 5px)' }}
          >
            {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
            {showShop && (
              <ShopModal 
  onClose={() => setShowShop(false)} 
  onPurchaseHints={handlePurchaseHints}
  onPurchaseRemoveAds={handlePurchaseRemoveAds}
  onPurchaseSkipAnytime={handlePurchaseSkipAnytime}
  onPurchaseSportsPack={handlePurchaseSportsPack}
  onPurchaseCinemaPack={handlePurchaseCinemaPack}
  onPurchaseBundle={handlePurchaseBundle}
  isAdFree={isPremium || !!stats.isAdFree}
  isSkipAnytimePurchased={hasSkipForever || !!stats.isSkipAnytimePurchased}
  isSportsPackPurchased={hasSport || !!stats.isSportsPackPurchased}
  isCinemaPackPurchased={hasCinema || !!stats.isCinemaPackPurchased}
  hintsRemaining={stats.hintsRemaining}
/>
            )}
            
{showHintMenu && (
              <HintModal 
                onRevealLetter={handleRevealLetterOption} 
                onRevealAuthor={handleRevealAuthorOption} 
                onRevealLocked={handleRevealLockedOption}
                onCancel={() => setShowHintMenu(false)}
                isAuthorRevealed={userState.isAuthorRevealed}
                hintsRemaining={userState.hintsRemaining}
                hasLockedCells={hasLockedCells}
                isAdReady={isAdReady}
                showAd={showAd}
                onWatchAd={() => {
                  setShowHintMenu(false);
                  showAd();
                }}
              />
            )}

            {showAuthorModal && levelData && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40" dir="rtl" onClick={() => {
                setShowAuthorModal(false);
                setUserState(prev => ({ ...prev, isAuthorRevealed: true }));
              }}>
                <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center" onClick={e => e.stopPropagation()}>
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    <i className="fa-solid fa-user-pen"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">מקור המשפט</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                    <p className="text-lg font-bold text-slate-700">{levelData.author}</p>
                    {levelData.year && (
                      <p className="text-sm font-medium text-slate-500 mt-1">{levelData.year}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setShowAuthorModal(false);
                      setUserState(prev => ({ ...prev, isAuthorRevealed: true }));
                    }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    המשך במשחק
                  </button>
                </div>
              </div>
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

            {reportToast && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-black text-sm animate-in slide-in-from-top flex items-center gap-3">
                <i className="fa-solid fa-envelope text-emerald-400"></i>
                אפליקציית המייל נפתחה לדיווח. תודה!
              </div>
            )}

            {rewardToast && (
              <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-sky-400 to-blue-500 text-white pl-3 pr-6 py-3 rounded-full shadow-2xl font-black text-sm md:text-base animate-in zoom-in fade-in duration-300 flex items-center gap-3 border-2 border-white/30 whitespace-nowrap">
                
                <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-gift text-yellow-300 text-lg"></i>
                </div>
                
                <span>תודה שצפית! זכית ברמז 1 במתנה</span>
                <i className="fa-solid fa-lightbulb text-yellow-100 mr-1"></i>

                <div className="w-px h-6 bg-white/30 mx-1"></div>

                <button 
                  onClick={() => setRewardToast(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="סגור הודעה"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
                
              </div>
            )}

            {packExhaustedToast && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold text-center animate-in slide-in-from-top flex flex-col items-center gap-1 border-2 border-blue-400">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>סיימת את כל הציטוטים בחבילה!</span>
                </div>
                <p className="text-[10px] opacity-90">בינתיים תקבל ציטוטים מקטגוריות אחרות. משפטים חדשים יתווספו בקרוב!</p>
              </div>
            )}
            
            {currentScreen === Screen.HOME ? (
              <MainMenu 
                key="home-screen"
                onNewGame={() => startNewGame()} 
                onContinue={continueGame} 
                hasSavedGame={hasSavedGame} 
                onStats={() => setCurrentScreen(Screen.STATS)} 
                onSettings={() => setCurrentScreen(Screen.SETTINGS)} 
                onAchievements={() => setCurrentScreen(Screen.ACHIEVEMENTS)} 
                onDailyQuiz={() => setCurrentScreen(Screen.DAILY_QUIZ)}
                onShowTutorial={() => setShowTutorial(true)} 
                onOpenShop={() => setShowShop(true)} 
                currentLevel={stats.currentLevel || 1} 
                hasUnclaimedAchievements={hasUnclaimedAchievements} 
                onSolitaireEvent={() => {
                  try {
                    const newPuzzle = generateSolitairePuzzle(Difficulty.MEDIUM, stats.solitaireQuoteIndex || 0); 
                    setLevelData(newPuzzle); 
                    setCurrentScreen(Screen.SOLITAIRE);
                  } catch (error) {
                    console.error("Failed to load solitaire from button:", error);
                  }
                }}             
              />
            ) : currentScreen === Screen.STATS ? (
              <StatsScreen key="stats-screen" stats={stats} onBack={() => setCurrentScreen(Screen.HOME)} />
            ) : currentScreen === Screen.DAILY_QUIZ ? (
              <DailyQuizCalendar 
                key="daily-quiz-screen"
                dailyProgress={stats.dailyProgress || {}} 
                onBack={() => setCurrentScreen(Screen.HOME)} 
                onSelectDate={startDailyGame} 
                initialMonth={levelData?.isDaily && levelData.dailyDate ? parseInt(levelData.dailyDate.split('-')[1], 10) - 1 : undefined}
              />
            ) : currentScreen === Screen.SETTINGS ? (
              <SettingsScreen 
                difficulty={difficultySetting} 
                onDifficultyChange={handleDifficultyChange} 
                fontSize={fontSize} 
                onFontSizeChange={(f) => setFontSize(f)} 
                vibrationEnabled={vibrationEnabled} 
                onVibrationToggle={() => setVibrationEnabled(!vibrationEnabled)} 
                soundEnabled={soundEnabled} 
                onSoundToggle={() => setSoundEnabled(!soundEnabled)} 
                notificationsEnabled={notificationsEnabled}
                onNotificationsToggle={() => setNotificationsEnabled(!notificationsEnabled)}
                notificationTime={notificationTime}
                onNotificationTimeChange={(t) => setNotificationTime(t)}
                onBack={() => setCurrentScreen(Screen.HOME)}
                stats={stats}
                onImportData={handleImportData}
                onReportMistake={handleReportMistake}
                activeCategories={activeCategories}
                onCategoriesChange={handleActiveCategoriesChange}
                onOpenShop={() => setShowShop(true)}
              />
            ) : currentScreen === Screen.ACHIEVEMENTS ? (
              <AchievementsScreen key="achievements-screen" stats={stats} onBack={() => setCurrentScreen(Screen.HOME)} onClaim={handleClaimAchievement} />
            ) : currentScreen === Screen.SOLITAIRE ? (
              levelData ? (
                <SolitaireGameMode 
                  key={`solitaire-${levelData.id}`}
                  levelData={levelData} 
                  fontSize={fontSize}
                  onBack={() => setCurrentScreen(Screen.HOME)} 
                  onWin={(mistakes, finalState) => {
                    setUserState(finalState);
                    setStatus(GameStatus.WON);
                    setIsOverlayVisible(true);
                      
                    const hasPlayedTrial = localStorage.getItem('hasPlayedSolitaireTrial') === 'true';
                    const eventActive = isEventTime(new Date());
                    
                    if (!eventActive && !hasPlayedTrial) {
                      localStorage.setItem('hasPlayedSolitaireTrial', 'true');
                    }
                    setCurrentScreen(Screen.PLAYING);
                    
                    setStats(prev => {
                      const newStats = { ...prev, solitaireQuoteIndex: (prev.solitaireQuoteIndex || 0) + 1 };
                      persistStats(newStats);
                      return newStats;
                    });
                  }} 
                  onLose={(finalState) => {
                    setUserState(finalState);
                    setStatus(GameStatus.LOST);
                    setIsOverlayVisible(true);
                    
                    const hasPlayedTrial = localStorage.getItem('hasPlayedSolitaireTrial') === 'true';
                    const eventActive = isEventTime(new Date());
                    
                    if (!eventActive && !hasPlayedTrial) {
                      localStorage.setItem('hasPlayedSolitaireTrial', 'true');
                    }
                    setCurrentScreen(Screen.PLAYING);
                  }} 
                  hintsRemaining={stats.hintsRemaining}
                  onSpendHints={(amount) => {
                    if (stats.hintsRemaining >= amount) {
                      setStats(prev => {
                        const newStats = { ...prev, hintsRemaining: prev.hintsRemaining - amount };
                        persistStats(newStats);
                        return newStats;
                      });
                      return true;
                    }
                    setShowShop(true);
                    return false;
                  }}
                />
              ) : (
                <div key="solitaire-loader" className="flex flex-col items-center justify-center h-full bg-slate-50">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-bold">טוען סוליטר...</p>
                </div>
              )
            ) : (
              <div key="playing-screen" className="flex flex-col h-full overflow-hidden">
                <Header mistakes={userState.mistakes} maxMistakes={userState.maxMistakes} hintsRemaining={userState.hintsRemaining} onUseHint={handleHintClick} isHintModeActive={isHintMode || isLockedHintMode} isIdle={isIdle} onUndo={handleUndoRequest} canUndo={history.length > 0} onRestart={() => handleGameOverAction()} onHome={() => setCurrentScreen(Screen.HOME)} onBack={levelData?.isDaily ? () => setCurrentScreen(Screen.DAILY_QUIZ) : undefined} onShowTutorial={() => setShowTutorial(true)} currentLevel={stats.currentLevel || 1} difficulty={currentLevelDifficulty} canRestart={canRestart} hasUnclaimedAchievements={hasUnclaimedAchievements} isDaily={levelData?.isDaily} />
                <main 
                  ref={mainScrollRef}
                  style={{ fontSize: '16.5px' }}
                  className="flex-1 overflow-y-auto px-2 py-4 md:px-6 md:py-8 max-w-4xl mx-auto w-full flex flex-col items-center"
                >
                  {status === GameStatus.LOADING ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500 font-medium text-center">מכין את הפאזל הבא...</p>
                    </div>
                  ) : (
                  <div key={levelData?.isDaily ? levelData.dailyDate : stats.currentLevel} className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 ease-out">
                       {levelData?.category && ['sports', 'cinema'].includes(levelData.category) && (
                        <div className="mb-5 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-4 py-1.5 rounded-full shadow-sm">
                          <i className={`fa-solid ${levelData.category === 'sports' ? 'fa-basketball text-orange-500' : 'fa-film text-purple-500'}`}></i>
                          <span className="text-xs font-black text-indigo-900">
                            {levelData.category === 'sports' ? 'חבילת ספורט' : 'חבילת קולנוע וטלוויזיה'}
                          </span>
                          <i className="fa-solid fa-crown text-amber-400 text-[10px] mr-1"></i>
                        </div>
                      )}
                    <Board level={levelData!} userState={userState} fontSize={fontSize} isHintMode={isHintMode} isLockedHintMode={isLockedHintMode} onSelect={handleCellClick} completedLetters={completedLetters} celebratingWordIdx={celebratingWordIdx} isCellLocked={isCellLocked} />
                  </div>
                  )}
                  {!isOverlayVisible && (status === GameStatus.WON || status === GameStatus.LOST) && (
                    <div className="mt-8 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-500 pb-8">
                      <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-sm">הפתרון נחשף בלוח!</div>
                      <button onClick={handleGameOverAction} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{levelData?.isDaily ? 'חזרה ליומן' : (status === GameStatus.WON ? 'לשלב הבא' : 'נסה שלב חדש')}</span>
                      </button>
                    </div>
                  )}
                </main>
                <div className="pb-1 md:pb-2 px-2 flex-shrink-0 flex flex-col items-center gap-1 md:gap-2">
                  <Keyboard onPress={handleKeyPress} disabled={status !== GameStatus.PLAYING || isHintMode || isLockedHintMode} completedLetters={completedLetters} foundLetters={foundLetters} />
                  {status === GameStatus.PLAYING && (
                    <div className="opacity-30 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={handleReportMistake} 
                        className="text-[9px] font-bold text-slate-400 flex items-center gap-1 border border-slate-200 border-dashed px-2 py-0.5 rounded-full transition-colors hover:bg-slate-50"
                      >
                        <i className="fa-solid fa-pen-nib"></i>
                        דווח על טעות
                      </button>
                    </div>
                  )}
                </div>
                {status === GameStatus.WON && isOverlayVisible && (
                  <GameOverlay title="כל הכבוד!" message={levelData?.isDaily ? `השלמת את החידון היומי!` : `סיימת את שלב ${stats.currentLevel - 1}!`} type="won" onAction={handleGameOverAction} onReveal={revealSolution} quote={levelData?.quote} author={levelData?.author} year={levelData?.year} showRevealButton={false} bonusMessage={rewardMessage} onReportMistake={handleReportMistake} />
                )}
                {status === GameStatus.LOST && isOverlayVisible && (
                  <GameOverlay 
                    title="המשחק נגמר" 
                    message={
                      levelData?.isDaily 
                        ? (isDailyRetryAllowed 
                            ? (dailyAttemptsLeft === 1 ? "שימו לב: נותר ניסיון אחרון להיום!" : `נותרו לך עוד ${dailyAttemptsLeft} ניסיונות להיום.`)
                            : "נגמרו הניסיונות להיום. נתראה מחר!") 
                        : "עשית יותר מדי טעויות. נסה שוב!"
                    } 
                    type="lost" 
                    onAction={handleGameOverAction} 
                    onRetry={(!levelData?.isDaily || isDailyRetryAllowed) ? handleRetryLevel : undefined} 
                    onReveal={revealSolution} 
                    author={levelData?.author} 
                    showRevealButton={!levelData?.isDaily} 
                    onReportMistake={handleReportMistake} 
                  />
                )}
              </div>
            )}
              </motion.div>
        )}
    </AnimatePresence>
</div>
  );
};

export default App;