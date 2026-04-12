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
}

const SolitaireGameMode: React.FC<SolitaireGameModeProps> = ({
  levelData,
  onBack,
  onWin,
  onLose
}) => {
  const { deck, pool, initGame, drawCards, playCard } = useSolitaireLogic();
  
  const [userState, setUserState] = useState<UserState>({
    score: 0,
    mistakes: 0,
    maxMistakes: levelData.maxMistakes || 5,
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
      cellFeedback: {}
    }));
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
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
        </div>
      </div>

      {/* Solitaire Cards Area */}
      <div className="shrink-0">
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