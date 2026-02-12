
import React from 'react';

interface BoardCellProps {
  char: string;
  num: number | null;
  userLetter: string | null;
  isSelected: boolean;
  isPreFilled: boolean;
  feedback: 'correct' | 'wrong' | 'pop-active' | null;
  isLocked: boolean;
  isSameNumAsSelected: boolean;
  isCompleted: boolean;
  isHintMode: boolean;
  shouldDance: boolean;
  onSelect: () => void;
  sizes: { letter: string; cell: string; special: string };
  animationDelay: string;
}

const BoardCell: React.FC<BoardCellProps> = ({
  num,
  userLetter,
  isSelected,
  isPreFilled,
  feedback,
  isLocked,
  isSameNumAsSelected,
  isCompleted,
  isHintMode,
  shouldDance,
  onSelect,
  sizes,
  animationDelay
}) => {
  // Determine Text Color
  let textColorClass = 'text-blue-700';
  
  if (isSelected && !isHintMode) {
    // If there's a letter, keep it dark (black/slate) as requested. 
    // If empty, use white for high contrast cursor look.
    textColorClass = userLetter ? 'text-slate-900' : 'text-white'; 
  } else if (shouldDance) {
    textColorClass = 'text-green-600';
  } else if (isPreFilled && !shouldDance) {
    textColorClass = 'text-slate-800'; 
  } else if (feedback === 'pop-active') {
    textColorClass = 'text-green-500';
  } else if (feedback === 'wrong') {
    textColorClass = 'text-rose-500';
  } else if (feedback === 'correct' && !shouldDance) {
    textColorClass = 'text-slate-800';
  }

  const dimensionClass = sizes.cell.split(' ').filter(c => c.startsWith('h-') || c.startsWith('min-w') || c.startsWith('md:')).join(' ');

  // Determine Background and Border Classes
  let containerClasses = 'bg-white border-slate-200 hover:border-blue-200';
  
  if (isSelected && !isHintMode) {
    // Differentiation: 
    // If it has a letter, use a strong light blue so black text is readable.
    // If it's empty, use dark blue for a "focused cursor" effect.
    containerClasses = userLetter
      ? 'animate-select-pulse bg-blue-200 border-blue-600 shadow-xl z-20 scale-120 ring-4 ring-blue-200'
      : 'animate-select-pulse bg-blue-600 border-blue-800 shadow-xl z-20 scale-120 ring-4 ring-blue-200';
  } else if (isCompleted) {
    containerClasses = 'bg-green-50/40 border-green-100';
  } else if (isHintMode && !userLetter) {
    containerClasses = 'bg-amber-50 border-amber-300 border-dashed animate-pulse ring-2 ring-amber-200';
  } else if (isLocked) {
    containerClasses = 'bg-slate-100 border-slate-300 shadow-inner';
  } else if (isSameNumAsSelected) {
    containerClasses = 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 scale-105 z-10 shadow-sm';
  }

  return (
    <div 
      onClick={onSelect}
      className={`flex flex-col items-center ${dimensionClass} cursor-pointer transition-all duration-200 group ${
        feedback === 'wrong' ? 'animate-shake' : ''
      } ${shouldDance ? 'animate-dance' : ''} ${isHintMode ? 'hover:scale-110 active:scale-95' : ''} ${isLocked ? 'grayscale-[0.5]' : ''}`}
      style={{ animationDelay }}
    >
      <div className={`${sizes.cell} flex items-center justify-center w-full transition-all duration-300 rounded-lg md:rounded-xl border-2 relative overflow-hidden ${containerClasses}`}>
        {isLocked && !userLetter && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] md:text-xs bg-slate-100/50">
            <i className="fa-solid fa-lock scale-90 md:scale-110"></i>
          </div>
        )}
        <span className={`${sizes.letter} font-black transition-all ${textColorClass} ${
          feedback === 'pop-active' ? 'animate-pop' : ''
        } drop-shadow-sm`}>
          {userLetter || ''}
        </span>
      </div>
      
      {/* Indicator bar below the cell */}
      <div className={`h-1 md:h-1.5 w-full mt-1 md:mt-2 rounded-full transition-all duration-300 ${
        shouldDance ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' :
        feedback === 'wrong' ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 
        feedback === 'pop-active' ? 'bg-green-500' :
        (isSelected && !isHintMode) ? (userLetter ? 'bg-blue-600 shadow-md' : 'bg-blue-800 shadow-[0_0_12px_#1e40af]') : 
        (isCompleted ? 'bg-green-200 opacity-50' : 
         (isHintMode && !userLetter ? 'bg-amber-400' : 
          (isLocked ? 'bg-slate-300' : 
           (isSameNumAsSelected ? 'bg-blue-400 shadow-sm' : 'bg-slate-200 group-hover:bg-slate-300'))))
      }`}></div>

      {/* Number label below the cell - Increased base size and scale */}
      <span className={`text-[11px] md:text-[13px] mt-0.5 md:mt-1.5 font-black h-4 md:h-5 transition-all duration-300 ${
        (isSelected && !isHintMode) ? 'text-blue-900 scale-140 font-black' : 
        (isSameNumAsSelected ? 'text-blue-600 font-extrabold scale-120' : 'text-slate-500')
      } ${isCompleted || isLocked ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        {num}
      </span>
    </div>
  );
};

export default BoardCell;
