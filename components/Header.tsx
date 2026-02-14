
import React from 'react';
import { Difficulty } from '../types';

interface HeaderProps {
  mistakes: number;
  maxMistakes: number;
  hintsRemaining: number;
  onUseHint: () => void;
  isHintModeActive?: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onRestart: () => void;
  onHome: () => void;
  onBack?: () => void;
  onShowTutorial: () => void;
  currentLevel: number;
  difficulty: Difficulty;
  canRestart?: boolean;
  hasUnclaimedAchievements?: boolean;
  isDaily?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  mistakes, 
  maxMistakes, 
  hintsRemaining,
  onUseHint,
  isHintModeActive = false,
  onUndo,
  canUndo,
  onRestart,
  onHome,
  onBack,
  onShowTutorial,
  currentLevel,
  difficulty,
  canRestart = true,
  hasUnclaimedAchievements = false,
  isDaily = false
}) => {
  const getDifficultyLabel = () => {
    switch (difficulty) {
      case Difficulty.EASY: return 'קל';
      case Difficulty.MEDIUM: return 'בינוני';
      case Difficulty.HARD: return 'קשה';
      case Difficulty.VERY_HARD: return 'קשה מאוד';
      default: return '';
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-white shadow-sm border-b border-gray-100 shrink-0 z-10" dir="rtl">
      {/* כפתורי ניהול וניווט */}
      <div className="flex items-center space-x-2 space-x-reverse">
        {onBack && (
          <button 
            onClick={onBack}
            title="חזור"
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <i className="fa-solid fa-arrow-right text-sm md:text-base"></i>
          </button>
        )}
        
        <button 
          onClick={onHome}
          title="חזרה לתפריט הראשי"
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors relative"
        >
          {hasUnclaimedAchievements && !isDaily && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse translate-x-1 -translate-y-1"></span>
          )}
          <i className="fa-solid fa-house text-sm md:text-base"></i>
        </button>
        {!isDaily && (
          <button 
            onClick={onRestart}
            disabled={!canRestart}
            title={canRestart ? "פאזל חדש" : "לא ניתן להחליף פאזל לאחר שהתחלת לנחש"}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-colors border ${
              canRestart 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 active:scale-95' 
                : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
            }`}
          >
            <i className="fa-solid fa-arrows-rotate text-sm md:text-base"></i>
          </button>
        )}
      </div>

      {/* מרכז: סטטוס שלב ופסילות */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <div className={`${isDaily ? 'bg-rose-500' : 'bg-blue-600'} text-white px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs sm:text-sm font-black shadow-md shadow-blue-100`}>
            {isDaily ? 'חידון יומי' : `שלב ${currentLevel}`}
          </div>
          <div className="bg-slate-100 text-slate-600 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-black border border-slate-200">
            {getDifficultyLabel()}
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2 space-x-reverse">
          {Array.from({ length: maxMistakes }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                i < mistakes 
                  ? 'border-rose-500 bg-rose-50 text-rose-500' 
                  : 'border-gray-100 text-transparent'
              }`}
            >
              {i < mistakes && <i className="fa-solid fa-xmark text-[8px] sm:text-[10px]"></i>}
            </div>
          ))}
        </div>
      </div>

      {/* כפתורי עזר למשחק */}
      <div className="flex items-center gap-1 md:gap-2">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${
            canUndo 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 shadow-sm active:scale-95' 
              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
          }`}
          title={canUndo ? "בטל פעולה אחרונה (Undo)" : "אין פעולות לביטול"}
        >
          <i className="fa-solid fa-arrow-rotate-left text-sm md:text-base"></i>
        </button>
        <button 
          onClick={onUseHint}
          disabled={hintsRemaining <= 0}
          className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl border transition-all duration-300 ${
            hintsRemaining > 0 
              ? isHintModeActive
                ? 'bg-amber-500 border-amber-600 text-white shadow-inner scale-95 ring-2 ring-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm active:scale-95' 
              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
          }`}
          title={hintsRemaining > 0 ? "תפריט רמזים" : "לא נותרו רמזים"}
        >
          <i className={`fa-solid fa-lightbulb text-sm md:text-base ${hintsRemaining > 0 && !isHintModeActive ? 'animate-pulse' : ''}`}></i>
          <span className="font-black text-xs md:text-sm">{hintsRemaining}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
