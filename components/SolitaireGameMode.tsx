import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameLevel, UserState, FontSize } from '../types';
import Board from './Board';
import SolitaireBoard from './SolitaireBoard';
import { useSolitaireLogic } from '../hooks/useSolitaireLogic';
import { isHebrewLetter, normalizeHebrewChar } from '../utils/textUtils';

interface SolitaireGameModeProps {
  levelData: GameLevel;
  onBack: () => void;
  onWin: (mistakes: number) => void;
  onLose: () => void;
  coins: number;
  onSpendCoins: (amount: number) => boolean;
}

const SolitaireGameMode: React.FC<SolitaireGameModeProps> = ({
  levelData,
  onBack,
  onWin,
  onLose,
  coins,
  onSpendCoins
}) => {
  const { deck, pool, initGame, drawCards, playCard, resetDeck } = useSolitaireLogic();
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [isAuthorRevealed, setIsAuthorRevealed] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

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
        missing.push(char);
      }
    }
    return missing;
  }, [levelData.quote, userState.cellGuesses]);

  const handleResetDeck = () => {
    if (onSpendCoins(2)) {
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
        if (levelData.revealedIndices.includes(i)) {
          initialGuesses[i] = char;
        } else {
          missingLetters.push(char);
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
    if (levelData.revealedIndices.includes(index)) return;
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
        setUserState(prev => ({ ...prev, cellGuesses: newGuesses, cellFeedback: newFeedback, selectedCellIndex: null }));
        setTimeout(() => onWin(mistakes), 500);
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
        setTimeout(() => onLose(), 500);
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header Area */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-slate-200 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-blue-600"></i>
          <span className="font-black text-slate-800">סוליטר צופן</span>
        </div>
        <div className="flex items-center gap-1" dir="ltr">
          {Array.from({ length: userState.maxMistakes }).map((_, i) => (
            <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              i < userState.mistakes ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-slate-200'
            }`}>
              {i < userState.mistakes && <i className="fa-solid fa-xmark text-[8px] sm:text-[10px]"></i>}
            </div>
          ))}
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center relative">
        <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500 ease-out">
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
                <div className="h-px w-12 bg-slate-200 mb-3"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">המקור / הדובר</p>
                <p className="text-slate-800 font-black text-lg">{levelData.author}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Hint Menu Overlay */}
        {showHintMenu && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-slate-800">רמזים ועזרה</h3>
                <button onClick={() => setShowHintMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
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
                    <span className="font-black text-indigo-600 text-xs">2</span>
                    <i className="fa-solid fa-coins text-amber-500 text-[10px]"></i>
                  </div>
                </button>

                <button 
                  onClick={handleUndoMistake}
                  disabled={userState.mistakes === 0}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                    userState.mistakes > 0 
                      ? 'bg-rose-50 border-rose-100 hover:bg-rose-100' 
                      : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                    <i className="fa-solid fa-heart-circle-check"></i>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">ביטול פסילה</p>
                    <p className="text-[10px] text-slate-500 font-bold">מחק טעות אחת שצברת</p>
                  </div>
                </button>

                <button 
                  onClick={handleRevealAuthor}
                  disabled={isAuthorRevealed}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                    !isAuthorRevealed 
                      ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' 
                      : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <i className="fa-solid fa-user-tag"></i>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">גלה את המקור</p>
                    <p className="text-[10px] text-slate-500 font-bold">מי הדובר או מה המקור?</p>
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
      <div className="shrink-0 relative">
        {/* Hint Button Trigger */}
        <button 
          onClick={() => setShowHintMenu(true)}
          className="absolute -top-14 left-4 w-12 h-12 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-10"
        >
          <i className="fa-solid fa-lightbulb text-xl"></i>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">?</span>
        </button>

        <SolitaireBoard 
          deck={deck} 
          pool={pool} 
          drawCards={drawCards} 
          onCardClick={handleCardClick} 
        />
      </div>
    </div>
  );
};

export default SolitaireGameMode;