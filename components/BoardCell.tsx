
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
  isLockedHintMode?: boolean;
  shouldDance: boolean;
  onSelect: () => void;
  sizes: { letter: string; cell: string; special: string };
  animationDelay: string;
  isFlexible?: boolean;
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
  isLockedHintMode = false,
  shouldDance,
  onSelect,
  sizes,
  animationDelay,
  isFlexible = false
}) => {
  // Determine Text Color
  let textColorClass = 'text-blue-700';
  
  if (isSelected && !isHintMode && !isLockedHintMode) {
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

  // Handle Dimension Classes with responsiveness for long words
  const baseDimensionClass = sizes.cell.split(' ').filter(c => c.startsWith('h-') || c.startsWith('w-') || c.startsWith('md:')).join(' ');
  
  // Custom sizing for flexible cells on mobile
  const flexStyle = isFlexible ? {
    width: 'clamp(24px, 8vw, 64px)',
    height: 'clamp(32px, 11vw, 84px)',
    minWidth: '0'
  } : {};

  // Background and Border Classes
  let containerClasses = 'bg-white border-slate-200 hover:border-blue-200';
  
  if (isSelected && !isHintMode && !isLockedHintMode) {
    containerClasses = userLetter
      ? 'animate-select-pulse bg-blue-200 border-blue-600 shadow-xl z-20 scale-110 ring-4 ring-blue-200'
      : 'animate-select-pulse bg-blue-600 border-blue-800 shadow-xl z-20 scale-110 ring-4 ring-blue-200';
  } else if (isCompleted) {
    containerClasses = 'bg-green-50/40 border-green-100';
  } else if (isLockedHintMode && isLocked && !userLetter) {
    containerClasses = 'bg-amber-100 border-amber-500 shadow-lg animate-select-pulse z-20 scale-105 ring-4 ring-amber-100';
  } else if (isHintMode && !userLetter && !isLocked) {
    containerClasses = 'bg-amber-50 border-amber-300 border-dashed animate-pulse ring-2 ring-amber-200';
  } else if (isLocked) {
    containerClasses = 'bg-slate-100 border-slate-300 shadow-inner';
  } else if (isSameNumAsSelected) {
    containerClasses = 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 scale-105 z-10 shadow-sm';
  }

  return (
    <div 
      onClick={onSelect}
      className={`flex flex-col items-center cursor-pointer transition-all duration-200 group ${
        feedback === 'wrong' ? 'animate-shake' : ''
      } ${shouldDance ? 'animate-dance' : ''} ${(isHintMode || isLockedHintMode) ? 'hover:scale-105 active:scale-95' : ''} ${isLocked && !isLockedHintMode ? 'grayscale-[0.5]' : ''}`}
      style={{ ...flexStyle, animationDelay }}
    >
      <div 
        className={`flex items-center justify-center w-full h-full transition-all duration-300 rounded-lg md:rounded-xl border-2 relative overflow-hidden ${containerClasses} ${!isFlexible ? baseDimensionClass : ''}`}
        style={isFlexible ? { height: '100%' } : {}}
      >
        {isLocked && !userLetter && (
          <div className={`absolute inset-0 flex items-center justify-center text-[10px] md:text-xs ${isLockedHintMode ? 'text-amber-700 bg-amber-200/30' : 'text-slate-400 bg-slate-100/50'}`}>
            <i className={`fa-solid ${isLockedHintMode ? 'fa-lock-open scale-110' : 'fa-lock'} scale-90 md:scale-110`}></i>
          </div>
        )}
        <span className={`${sizes.letter} font-black transition-all ${textColorClass} ${
          feedback === 'pop-active' ? 'animate-pop' : ''
        } drop-shadow-sm ${isFlexible ? 'text-[clamp(16px,5vw,40px)]' : ''}`}>
          {userLetter || ''}
        </span>
      </div>
      
      {/* Indicator bar below the cell */}
      <div className={`h-1 md:h-1.5 w-full mt-1 md:mt-2 rounded-full transition-all duration-300 ${
        shouldDance ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' :
        feedback === 'wrong' ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 
        feedback === 'pop-active' ? 'bg-green-500' :
        (isSelected && !isHintMode && !isLockedHintMode) ? (userLetter ? 'bg-blue-600 shadow-md' : 'bg-blue-800 shadow-[0_0_12px_#1e40af]') : 
        (isCompleted ? 'bg-green-200 opacity-50' : 
         (isLockedHintMode && isLocked && !userLetter ? 'bg-amber-600 shadow-md' :
          (isHintMode && !userLetter && !isLocked ? 'bg-amber-400' : 
           (isLocked ? 'bg-slate-300' : 
            (isSameNumAsSelected ? 'bg-blue-400 shadow-sm' : 'bg-slate-200 group-hover:bg-slate-300')))))
      }`}></div>

      {/* Number label below the cell */}
      <span className={`text-[11px] md:text-[13px] mt-0.5 md:mt-1.5 font-black h-4 md:h-5 transition-all duration-300 ${
        (isSelected && !isHintMode && !isLockedHintMode) ? 'text-blue-900 scale-125 font-black' : 
        (isSameNumAsSelected ? 'text-blue-600 font-extrabold scale-110' : 'text-slate-500')
      } ${(isCompleted || isLocked) && !isLockedHintMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${isLockedHintMode && isLocked ? 'text-amber-800 font-black scale-110' : ''} ${isFlexible ? 'text-[clamp(8px,2.5vw,13px)]' : ''}`}>
        {num}
      </span>
    </div>
  );
};

export default BoardCell;
