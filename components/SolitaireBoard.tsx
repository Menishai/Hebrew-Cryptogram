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
      <button
        onClick={drawCards}
        disabled={deck.length === 0}
        className={`relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl flex flex-col items-center justify-center transition-all shrink-0 ${
          deck.length > 0
            ? 'bg-blue-600 text-white shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:bg-blue-700 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
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

      {/* Pool (Middle) */}
      <div className="flex gap-2 sm:gap-3">
        {pool.map((stack, index) => {
          const topCard = stack.length > 0 ? stack[stack.length - 1] : null;

          return (
            <div key={index} className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0">
              {/* Empty slot placeholder */}
              <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50"></div>

              {/* Stack visual effects (bottom-right offset) */}
              {stack.length > 2 && (
                <div className="absolute inset-0 bg-slate-800/20 rounded-xl translate-x-2 translate-y-2 sm:translate-x-2.5 sm:translate-y-2.5"></div>
              )}
              {stack.length > 1 && (
                <div className="absolute inset-0 bg-slate-800/30 rounded-xl translate-x-1 translate-y-1 sm:translate-x-1.5 sm:translate-y-1.5"></div>
              )}

              {/* Top Card */}
              {topCard && (
                <button
                  key={`${index}-${stack.length}`}
                  onClick={() => onCardClick(index, topCard)}
                  className="absolute inset-0 bg-white border-2 border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-xl sm:text-2xl font-black text-slate-800 hover:border-blue-400 hover:text-blue-600 active:scale-95 transition-all"
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