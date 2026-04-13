import React from 'react';

interface SolitaireBoardProps {
  deck: string[];
  pool: string[][];
  drawCards: () => void;
  onCardClick: (index: number, letter: string) => void;
}

const SolitaireBoard: React.FC<SolitaireBoardProps> = ({
  deck,
  pool,
  drawCards,
  onCardClick
}) => {
  return (
    <div className="w-full px-2 py-4 sm:px-4 sm:py-6 bg-slate-100 border-t border-slate-200 flex items-center justify-center gap-4 sm:gap-8 select-none" dir="ltr">
      {/* Deck (Left) */}
      <div className="relative w-14 h-20 sm:w-16 sm:h-24 shrink-0">
        {/* Deck visual effects (bottom offset) */}
        {deck.length > 1 && Array.from({ length: Math.min(deck.length - 1, 4) }).map((_, i) => {
          const layers = Math.min(deck.length - 1, 4);
          const offset = layers - i; // e.g., 4, 3, 2, 1
          return (
            <div 
              key={i}
              className="absolute inset-0 bg-blue-800 border border-blue-900 rounded-xl shadow-sm"
              style={{
                transform: `translateY(${offset * 3}px)`,
                zIndex: i
              }}
            ></div>
          );
        })}

      <button
        onClick={drawCards}
        disabled={deck.length === 0}
          className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center transition-all z-10 ${
          deck.length > 0
            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 active:translate-y-[2px]'
            : 'bg-slate-200 border-2 border-dashed border-slate-300 text-slate-400 opacity-60 cursor-not-allowed'
        }`}
      >
        {deck.length > 0 ? (
          <>
            <div className="absolute inset-1 border-2 border-blue-400/30 rounded-lg pointer-events-none"></div>
            <i className="fa-solid fa-layer-group text-lg sm:text-xl mb-1"></i>
            <span className="font-black text-xs sm:text-sm">{deck.length}</span>
          </>
        ) : (
          <i className="fa-solid fa-ban text-xl"></i>
        )}
      </button>
    </div>


      {/* Pool (Middle) */}
      <div className="flex gap-2 sm:gap-3">
        {pool.map((stack, index) => {
          const topCard = stack.length > 0 ? stack[stack.length - 1] : null;

          return (
            <div key={index} className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0">
              {/* Empty slot placeholder */}
              <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50"></div>

              {/* Stack visual effects (bottom offset) */}
              {stack.length > 1 && Array.from({ length: Math.min(stack.length - 1, 4) }).map((_, i) => {
                const layers = Math.min(stack.length - 1, 4);
                const offset = layers - i; // e.g., 4, 3, 2, 1
                return (
                  <div 
                    key={i}
                    className="absolute inset-0 bg-slate-50 border border-slate-300 rounded-xl shadow-sm"
                    style={{
                      transform: `translateY(${offset * 4}px)`,
                      zIndex: i
                    }}
                  ></div>
                );
              })}

              {/* Top Card */}
              {topCard && (
                <button
                  key={`${index}-${stack.length}`}
                  onClick={() => onCardClick(index, topCard)}
                  className="absolute inset-0 bg-white border-2 border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-xl sm:text-2xl font-black text-slate-800 hover:border-blue-400 hover:text-blue-600 active:scale-95 transition-all z-10"
                >
                  {topCard}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolitaireBoard;