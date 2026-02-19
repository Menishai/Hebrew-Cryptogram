
import React from 'react';
import { GameLevel, UserState, FontSize } from '../types';
import { normalizeHebrewChar, isHebrewLetter } from '../utils/textUtils';
import BoardCell from './BoardCell';

interface BoardProps {
  level: GameLevel;
  userState: UserState;
  fontSize: FontSize;
  isHintMode?: boolean;
  isLockedHintMode?: boolean;
  onSelect: (idx: number) => void;
  completedLetters: Set<string>;
  celebratingWordIdx: number | null;
  isCellLocked: (idx: number) => boolean;
}

const Board: React.FC<BoardProps> = ({ 
  level, 
  userState, 
  fontSize,
  isHintMode = false,
  isLockedHintMode = false,
  onSelect, 
  completedLetters, 
  celebratingWordIdx,
  isCellLocked
}) => {
  const words = level.quote.split(' ');
  let globalCharIdx = 0;

  const selectedNum = userState.selectedCellIndex !== null && isHebrewLetter(level.quote[userState.selectedCellIndex])
    ? level.mapping[level.quote[userState.selectedCellIndex]]
    : null;

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case FontSize.SMALL:
        return {
          letter: 'text-xl md:text-2xl',
          cell: 'h-10 w-8 md:h-12 md:w-10',
          special: 'text-xl md:text-2xl'
        };
      case FontSize.LARGE:
        return {
          letter: 'text-4xl md:text-6xl',
          cell: 'h-20 w-16 md:h-28 md:w-20',
          special: 'text-4xl md:text-6xl'
        };
      case FontSize.MEDIUM:
      default:
        return {
          letter: 'text-3xl md:text-5xl',
          cell: 'h-14 w-11 md:h-20 md:w-16',
          special: 'text-3xl md:text-5xl'
        };
    }
  };

  const sizes = getFontSizeClasses();

  return (
    <div className={`flex flex-wrap justify-center content-start gap-x-4 gap-y-6 md:gap-x-12 md:gap-y-12 py-4 md:py-8 w-full max-w-full transition-all duration-300 ${(isHintMode || isLockedHintMode) ? 'opacity-90' : ''}`} dir="rtl">
      {(isHintMode || isLockedHintMode) && (
        <div className="w-full text-center mb-4 animate-bounce relative z-20">
          <span className="bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-black text-sm border-2 border-amber-300 shadow-lg inline-flex items-center gap-2">
            <i className={`fa-solid ${isLockedHintMode ? 'fa-lock-open' : 'fa-hand-pointer'} text-amber-600`}></i>
            {isLockedHintMode ? 'בחר אות נעולה לחשיפה' : 'בחר משבצת לחשיפה'}
          </span>
        </div>
      )}
      
      {words.map((word, wordIdx) => {
        const isWordCelebrating = celebratingWordIdx === wordIdx;
        const wordLength = word.length;
        
        // Dynamic scaling logic for mobile: 
        // If word is longer than 6 characters, we apply a class that allows it to shrink
        const isLongWord = wordLength > 6;
        
        const wordElements = word.split('').map((char, charInWordIdx) => {
          const currentIdx = globalCharIdx + charInWordIdx;
          const isLetter = isHebrewLetter(char);
          const num = isLetter ? level.mapping[char] : null;
          
          if (!isLetter) {
            return (
              <div key={charInWordIdx} className={`flex flex-col items-center justify-center pb-2 md:pb-5 transition-all ${isWordCelebrating ? 'text-green-500 animate-dance' : 'text-slate-400'}`}>
                <span className={`${sizes.special} font-black`}>{char}</span>
              </div>
            );
          }

          const baseChar = normalizeHebrewChar(char);
          const cellLocked = isCellLocked(currentIdx);
          
          return (
            <BoardCell 
              key={charInWordIdx}
              char={char}
              num={num}
              userLetter={userState.cellGuesses[currentIdx]}
              isSelected={userState.selectedCellIndex === currentIdx}
              isPreFilled={level.revealedIndices.includes(currentIdx)}
              feedback={userState.cellFeedback[currentIdx]}
              isLocked={cellLocked}
              isSameNumAsSelected={selectedNum !== null && num === selectedNum}
              isCompleted={completedLetters.has(baseChar)}
              isHintMode={isHintMode}
              isLockedHintMode={isLockedHintMode}
              shouldDance={isWordCelebrating}
              onSelect={() => onSelect(currentIdx)}
              sizes={sizes}
              animationDelay={isWordCelebrating ? `${charInWordIdx * 0.05}s` : '0s'}
              isFlexible={isLongWord}
            />
          );
        });

        const wordGroup = (
          <div 
            key={wordIdx} 
            className={`flex flex-nowrap gap-1 md:gap-3 justify-center max-w-full ${isLongWord ? 'shrink-0' : ''}`}
          >
            {wordElements}
          </div>
        );
        
        const wordWithIndexUpdate = (
          <React.Fragment key={wordIdx}>
            {wordGroup}
            {/* Logic to update globalCharIdx happens outside the render map to stay clean */}
          </React.Fragment>
        );

        globalCharIdx += word.length + 1;
        return wordGroup;
      })}
      
      {/* Hidden author by default, only shown if revealed */}
      <div className={`w-full mt-8 md:mt-14 text-center text-lg md:text-xl font-medium transition-all duration-500 flex flex-col items-center ${userState.isAuthorRevealed ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} dir="rtl">
        <div className="h-0.5 w-16 bg-slate-200 mb-2 rounded-full"></div>
        <span className="italic text-slate-600">{level.author}</span>
      </div>
    </div>
  );
};

export default Board;
