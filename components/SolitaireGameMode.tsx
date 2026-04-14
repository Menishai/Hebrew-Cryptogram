import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameLevel, UserState, FontSize } from '../types';
import Board from './Board';
import SolitaireBoard from './SolitaireBoard';
import { useSolitaireLogic } from '../hooks/useSolitaireLogic';
import { isHebrewLetter, normalizeHebrewChar } from '../utils/textUtils';
import { AdMob, RewardItem } from '@capacitor-community/admob'; // <--- ייבוא AdMob

// מזהה טסט של גוגל - חובה להחליף למזהה האמיתי שלך מ-AdMob לפני העלאה לחנות!
const SOLITAIRE_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

interface SolitaireGameModeProps {
  levelData: GameLevel;
  onBack: () => void;
  onWin: (mistakes: number, finalState: UserState) => void;
  onLose: (finalState: UserState) => void;
  hintsRemaining: number;
  onSpendHints: (amount: number) => boolean;
  fontSize: FontSize;
}

const SolitaireGameMode: React.FC<SolitaireGameModeProps> = ({
  levelData,
  onBack,
  onWin,
  onLose,
  hintsRemaining,
  onSpendHints,
  fontSize
}) => {
  // שמנו לב שהוספנו את reshuffleCurrentCards למשיכה מה-Hook
  const { deck, pool, initGame, drawCards, playCard, resetDeck, reshuffleCurrentCards } = useSolitaireLogic();
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAuthorRevealed, setIsAuthorRevealed] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

 // --- תחילת אזור AdMob ---
  const pendingRewardRef = useRef<'hint' | 'reshuffle' | null>(null);
  const [isAdReady, setIsAdReady] = useState(false); // המשתנה שזוכר אם הפרסומת מוכנה

  useEffect(() => {
    const preloadAd = async () => {
      try {
        await AdMob.prepareRewardVideoAd({ 
          adId: SOLITAIRE_AD_UNIT_ID, 
          isTesting: true 
        });
        setIsAdReady(true);
      } catch (error) {
        console.error('Failed to preload ad:', error);
      }
    };

    preloadAd();

    const rewardListener = AdMob.addListener('onRewardedVideoAdReward', (reward: RewardItem) => {
      if (pendingRewardRef.current === 'reshuffle') {
        if (reshuffleCurrentCards) {
          reshuffleCurrentCards();
        }
        alert('תודה שצפית! הקלפים נאספו ועורבבו מחדש.');
      }
      pendingRewardRef.current = null;
    });

    const dismissListener = AdMob.addListener('onRewardedVideoAdDismissed', () => {
      setIsAdReady(false);
      preloadAd();
    });

    return () => {
      rewardListener.remove();
      dismissListener.remove();
    };
  }, [reshuffleCurrentCards]); // שים לב שהורדנו מפה את onEarnHint

  const triggerReshuffleAd = async () => {
    if (isAdReady) {
      pendingRewardRef.current = 'reshuffle';
      await AdMob.showRewardVideoAd();
    } else {
      alert('הפרסומת עדיין נטענת, אנא המתן שנייה ונסה שוב.');
    }
  };
  // --- סוף אזור AdMob ---

  const [userState, setUserState] = useState<UserState>({
    score: 0,
    mistakes: 0,
    maxMistakes: 3,
    hintsRemaining: 0,
    cellGuesses: {},
    selectedCellIndex: null,
    cellFeedback: {},
    currentLevel: 1,
    isAuthorRevealed: false,
    hintRevealedIndices: [],
    hintsUsedThisLevel: 0,
    hintsByTypeThisLevel: { letter: 0, author: 0, locked: 0 }
  });
  
  // Helper to get all currently missing letters (not yet guessed correctly)
  const getMissingLetters = useCallback(() => {
    const missing: string[] = [];
    for (let i = 0; i < levelData.quote.length; i++) {
      const char = levelData.quote[i];
      if (isHebrewLetter(char) && !userState.cellGuesses[i]) {
        missing.push(normalizeHebrewChar(char));
      }
    }
    return missing;
  }, [levelData.quote, userState.cellGuesses]);

  const handleResetDeck = () => {
    if (onSpendHints(2)) {
      const missing = getMissingLetters();
      resetDeck(missing);
      setShowHintMenu(false);
    }
  };

  const handleUndoMistake = () => {
    if (userState.mistakes > 0) {
      setUserState(prev => ({ ...prev, mistakes: Math.max(0, prev.mistakes - 1) }));
      setShowHintMenu(false);
    }
  };

  const handleRevealAuthor = () => {
    setShowAuthorModal(true);
    setShowHintMenu(false);
  };

  // Initialize the game when levelData changes
  useEffect(() => {
    const missingLetters: string[] = [];
    const initialGuesses: Record<number, string> = {};
    let firstEmptyIdx = -1;

    for (let i = 0; i < levelData.quote.length; i++) {
      const char = levelData.quote[i];
      if (isHebrewLetter(char)) {
        if (levelData.revealedIndices && levelData.revealedIndices.includes(i)) {
          initialGuesses[i] = char;
        } else {
          missingLetters.push(normalizeHebrewChar(char));
          if (firstEmptyIdx === -1) firstEmptyIdx = i;
        }
      }
    }

    initGame(missingLetters);
    
    setUserState(prev => ({
      ...prev,
      cellGuesses: initialGuesses,
      selectedCellIndex: firstEmptyIdx === -1 ? null : firstEmptyIdx,
      mistakes: 0,
      maxMistakes: 3,
      cellFeedback: {}
    }));
    setIsAuthorRevealed(false);
    setShowAuthorModal(false);
  }, [levelData, initGame]);

  const handleCellSelect = useCallback((index: number) => {
    if (levelData.revealedIndices && levelData.revealedIndices.includes(index)) return;
    if (userState.cellGuesses[index]) return; // Already guessed correctly
    setUserState(prev => ({ ...prev, selectedCellIndex: index }));
  }, [levelData, userState.cellGuesses]);

  const handleCardClick = useCallback((poolIndex: number, letter: string) => {
    const { selectedCellIndex, cellGuesses, mistakes, maxMistakes } = userState;
    
    if (selectedCellIndex === null) return;
    
    const correctChar = levelData.quote[selectedCellIndex];
    
    if (normalizeHebrewChar(correctChar) === normalizeHebrewChar(letter)) {
      // Correct match!
      playCard(poolIndex);
      
      const newGuesses = { ...cellGuesses, [selectedCellIndex]: correctChar };
      const newFeedback = { ...userState.cellFeedback, [selectedCellIndex]: 'correct' as const };
      
      // Check win condition
      const isWin = levelData.quote.split('').every((char, i) => {
        if (!isHebrewLetter(char)) return true;
        return newGuesses[i] && normalizeHebrewChar(newGuesses[i]) === normalizeHebrewChar(char);
      });

      if (isWin) {
        const finalState = { ...userState, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: null };
        setUserState(finalState);
        setTimeout(() => onWin(mistakes, finalState), 500);
        return;
      }

      // Auto-advance to the next empty cell
      let nextIdx: number | null = null;
      for (let i = selectedCellIndex + 1; i < levelData.quote.length; i++) {
        if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i]) {
          nextIdx = i; break;
        }
      }
      if (nextIdx === null) {
        for (let i = 0; i < selectedCellIndex; i++) {
          if (isHebrewLetter(levelData.quote[i]) && !newGuesses[i]) {
            nextIdx = i; break;
          }
        }
      }

      setUserState(prev => ({
        ...prev,
        cellGuesses: newGuesses,
        cellFeedback: newFeedback,
        selectedCellIndex: nextIdx
      }));

    } else {
      // Wrong match
      const newMistakes = mistakes + 1;
      setUserState(prev => ({
        ...prev,
        mistakes: newMistakes,
        cellFeedback: { ...prev.cellFeedback, [selectedCellIndex]: 'wrong' as const }
      }));

      // Clear wrong feedback after a short delay
      setTimeout(() => {
        setUserState(prev => {
          const updatedFeedback = { ...prev.cellFeedback };
          if (updatedFeedback[selectedCellIndex] === 'wrong') {
            delete updatedFeedback[selectedCellIndex];
          }
          return { ...prev, cellFeedback: updatedFeedback };
        });
      }, 800);

      if (newMistakes >= maxMistakes) {
        const finalState = { 
          ...userState, 
          mistakes: newMistakes, 
          cellFeedback: { ...userState.cellFeedback, [selectedCellIndex]: 'wrong' as const } 
        };
        setTimeout(() => onLose(finalState), 500);
      }
    }
  }, [userState, levelData, playCard, onWin, onLose]);

  // Calculate completed letters for the Board component styling
  const completedLetters = useMemo(() => {
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-950 via-purple-500 to-slate-800 overflow-hidden" dir="rtl">
      {/* Event Theme Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] bg-amber-500/10 blur-[80px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Header Area */}
      <div className="flex items-center justify-between p-4 bg-indigo-950/50 backdrop-blur-md border-b border-white/10 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors">
            <i className="fa-solid fa-arrow-right"></i>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-crown text-amber-400 text-sm"></i>
              <span className="font-black text-white tracking-wide">טורניר סוליטר</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Special Event</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mistakes Indicator */}
          <div className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full border border-white/5" dir="ltr">
            {Array.from({ length: userState.maxMistakes }).map((_, i) => (
              <div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                i < userState.mistakes ? 'border-rose-500 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'border-white/20 bg-transparent'
            }`}>
                {i < userState.mistakes && <i className="fa-solid fa-xmark text-[8px] sm:text-[10px] text-white"></i>}
              </div>
            ))}
          </div>

          {/* Hint Button in Header */}
          <button 
            onClick={() => setShowHintMenu(true)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
          >
            <i className="fa-solid fa-lightbulb text-lg"></i>
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-indigo-950 shadow-sm">
              {hintsRemaining}
            </span>
          </button>
          
          {/* Help Button */}
          <button 
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all active:scale-95"
            title="איך משחקים?"
          >
            <i className="fa-solid fa-question text-lg"></i>
          </button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center relative z-10">
        <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500 ease-out bg-white/95 backdrop-blur-sm p-7 rounded-3xl shadow-2xl border border-white/20">
          <Board 
            level={levelData} 
            userState={userState} 
            fontSize={FontSize.MEDIUM} 
            isHintMode={false} 
            isLockedHintMode={false} 
            onSelect={handleCellSelect} 
            completedLetters={completedLetters} 
            celebratingWordIdx={null} 
            isCellLocked={() => false} 
          />
          
          {isAuthorRevealed && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex flex-col items-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">המקור / הדובר</p>
                <p className="text-slate-800 font-black text-lg">{levelData.author}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Hint Menu Overlay */}
        {showHintMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] shadow-2xl p-6 border border-indigo-100 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-xl text-indigo-900">עזרים לטורניר</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <i className="fa-solid fa-lightbulb text-amber-500 text-xs"></i>
                    <span className="text-xs font-bold text-slate-500">יש לך {hintsRemaining} רמזים</span>
                  </div>
                </div>
                <button onClick={() => setShowHintMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleResetDeck}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <i className="fa-solid fa-rotate-left"></i>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800 text-sm">ערבב מחדש</p>
                      <p className="text-[10px] text-slate-500 font-bold">החזר את כל הקלפים לקופה</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-200 shadow-sm">
                    <span className="font-black text-indigo-600 text-s">2</span>
                    <i className="fa-solid fa-coins text-amber-500 text-[14px]"></i>
                  </div>
                </button>

                <button 
                  onClick={handleUndoMistake}
                  disabled={userState.mistakes === 0}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    userState.mistakes > 0 
                      ? 'bg-rose-50 border-rose-100 hover:bg-rose-100' 
                      : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                    <i className="fa-solid fa-heart-circle-check"></i>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">ביטול פסילה</p>
                    <p className="text-[10px] text-slate-500 font-bold">מחק טעות אחת שצברת</p>
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-200 shadow-sm">
                    <span className="font-black text-indigo-600 text-s">1</span>
                    <i className="fa-solid fa-coins text-amber-500 text-[14px]"></i>
                  </div>
                </div>
                </button>

                <button 
                  onClick={handleRevealAuthor}
                  disabled={isAuthorRevealed}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    !isAuthorRevealed 
                      ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' 
                      : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <i className="fa-solid fa-user-tag"></i>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">גלה את המקור</p>
                    <p className="text-[10px] text-slate-500 font-bold">מי הדובר או מה המקור?</p>
                  </div>
                </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-200 shadow-sm">
                    <span className="font-black text-indigo-600 text-s">1</span>
                    <i className="fa-solid fa-coins text-amber-500 text-[14px]"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Author Reveal Modal */}
        {showAuthorModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <i className="fa-solid fa-user-pen"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">מקור המשפט</h3>
              <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 shadow-sm">
                <p className="text-xl font-black text-blue-600">{levelData.author}</p>
                {levelData.year && (
                  <p className="text-sm font-bold text-slate-400 mt-2">{levelData.year}</p>
                )}
              </div>
              <button 
                onClick={() => setShowAuthorModal(false)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
              >
                הבנתי, תודה!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Solitaire Cards Area */}
<div className="shrink-0 relative z-10 bg-black/20 backdrop-blur-md border-t border-white/10 pt-4 pb-[calc(0.1rem+env(safe-area-inset-bottom))] flex flex-col items-center">        
        {/* כפתור פרסומת לערבוב מחדש (AdMob) */}
        <SolitaireBoard 
          deck={deck} 
          pool={pool} 
          drawCards={drawCards} 
          onCardClick={handleCardClick} 
          onReshuffleAdClick={triggerReshuffleAd}
        />
        </div>
                {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-indigo-100 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-circle-info text-2xl"></i>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">איך משחקים סוליטר?</h2>
                </div>
                <button onClick={() => setShowHelp(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-right custom-scrollbar">
                <div className="space-y-3">
                  <h3 className="font-black text-indigo-600 flex items-center gap-2">
                    <i className="fa-solid fa-layer-group"></i>
                    הקופה והערימות
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    בכל פעם שולפים קלפים מהקופה (משמאל). הקלפים נערמים ב-5 ערימות. רק הקלף העליון בכל ערימה זמין לשימוש.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-indigo-600 flex items-center gap-2">
                    <i className="fa-solid fa-i-cursor"></i>
                    בחירת משבצת
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    לחצו על משבצת ריקה בלוח כדי לסמן אותה. לאחר מכן, לחצו על קלף מהערימות כדי לנסות להתאים אותו למשבצת.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-indigo-600 flex items-center gap-2">
                    <i className="fa-solid fa-hashtag"></i>
                    חוק המספרים
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    כמו במשחק הרגיל, כל מספר מייצג אות. אם תתאימו אות נכונה למספר, כל המשבצות עם אותו מספר יתמלאו בבת אחת!
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-rose-500 flex items-center gap-2">
                    <i className="fa-solid fa-heart-crack"></i>
                    פסילות
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    טעות בהתאמה תעלה לכם בפסילה. צברתם 3 פסילות? המשחק נגמר. השתמשו ברמזים כדי לבטל פסילות או לערבב את הקופה.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                הבנתי, בואו נמשיך!
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default SolitaireGameMode;