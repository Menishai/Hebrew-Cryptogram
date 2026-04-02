
import React from 'react';
import { normalizeHebrewChar } from '../utils/textUtils';

interface KeyboardProps {
  onPress: (letter: string) => void;
  disabled: boolean;
  completedLetters: Set<string>;
  foundLetters: Set<string>;
}

const Keyboard: React.FC<KeyboardProps> = ({ onPress, disabled, completedLetters, foundLetters }) => {
  /**
   * Hebrew Mobile Keyboard Layout:
   * Row 1: ק ר א ט ו ן ם פ (8)
   * Row 2: ש ד ג כ ע י ח ל ך ף (10)
   * Row 3: ז ס ב ה נ מ צ ת ץ (9)
   */
  const rows = [
    ['פ', 'ם', 'ן', 'ו', 'ט', 'א', 'ר', 'ק'],
    ['ף', 'ך', 'ל', 'ח', 'י', 'ע', 'כ', 'ג', 'ד', 'ש'],
    ['ץ', 'ת', 'צ', 'מ', 'נ', 'ה', 'ב', 'ס', 'ז']
  ];

  return (
    <div className="flex flex-col items-center space-y-1 md:space-y-2 max-w-3xl mx-auto w-full px-1" dir="rtl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 10px)' }}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center space-x-1 space-x-reverse w-full">
          {row.map(letter => {
            const normalized = normalizeHebrewChar(letter);
            const isCompleted = completedLetters.has(normalized);
            const isDiscovered = foundLetters.has(normalized);

            return (
              <button
                key={letter}
                onClick={() => onPress(letter)}
                disabled={disabled || isCompleted}
                className={`
                  relative flex-1 h-11 sm:h-12 md:h-14 rounded-lg md:rounded-xl font-bold text-lg sm:text-xl transition-all active:scale-95 touch-manipulation select-none
                  flex items-center justify-center
                  ${isCompleted 
                    ? 'bg-slate-100 text-slate-300 cursor-default border-slate-100 shadow-none' 
                    : isDiscovered
                      ? 'bg-gradient-to-b from-blue-400 to-blue-500 text-white border-b-4 border-blue-600 shadow-blue-200 shadow-md ring-1 ring-blue-300'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-b-4 border-slate-200 hover:border-slate-300 shadow-sm'
                  }
                  ${disabled && !isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="drop-shadow-sm">{letter}</span>
                {isDiscovered && !isCompleted && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
