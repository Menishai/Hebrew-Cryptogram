
import React, { useMemo } from 'react';

interface GameOverlayProps {
  title: string;
  message: string;
  type: 'won' | 'lost';
  onAction: () => void;
  onRetry?: () => void;
  onReveal: () => void;
  quote?: string;
  author?: string;
  year?: string;
  showRevealButton?: boolean;
  bonusMessage?: string | null;
}

const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 3 + 's',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: Math.random() * 2 + 3 + 's',
      size: Math.random() * 6 + 6 + 'px',
      shape: Math.random() > 0.5 ? '50%' : '2px'
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute opacity-90 shadow-sm"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            backgroundColor: p.backgroundColor,
            animation: `fall ${p.animationDuration} linear infinite`,
            animationDelay: p.animationDelay
          }}
        />
      ))}
    </div>
  );
};

const GameOverlay: React.FC<GameOverlayProps> = ({ 
  title, 
  message, 
  type, 
  onAction, 
  onRetry,
  onReveal, 
  quote,
  author,
  year,
  showRevealButton = false,
  bonusMessage
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/40" dir="rtl">
      {type === 'won' && <Confetti />}
      
      <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto relative z-10 border-4 ${type === 'won' ? 'border-green-100' : 'border-rose-100'}`}>
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-4xl shadow-lg flex-shrink-0 ${
          type === 'won' ? 'bg-green-500 text-white animate-bounce shadow-green-200' : 'bg-rose-100 text-rose-600 shadow-rose-100'
        }`}>
          <i className={`fa-solid ${type === 'won' ? 'fa-check' : 'fa-face-frown'}`}></i>
        </div>
        
        <h2 className={`text-3xl md:text-4xl font-black mb-3 ${type === 'won' ? 'text-green-600' : 'text-slate-800'}`}>
          {title}
        </h2>
        
        <p className="text-slate-400 font-bold mb-6 md:mb-8 uppercase tracking-widest text-xs md:text-sm">{message}</p>

        {bonusMessage && (
          <div className="mb-6 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl font-black text-sm border-2 border-amber-200 animate-bounce flex items-center gap-3">
            <i className="fa-solid fa-gift"></i>
            {bonusMessage}
          </div>
        )}

        {type === 'won' && quote && (
          <div className="w-full relative bg-slate-50 p-6 md:p-8 rounded-[2rem] mb-8 md:mb-10 border border-slate-100 shadow-inner">
            <div className="absolute -top-4 right-8 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-slate-300 text-xl border border-slate-50">
              <i className="fa-solid fa-quote-right"></i>
            </div>
            
            <p className="text-xl md:text-3xl font-black text-slate-800 mb-6 leading-tight italic">
              {quote}
            </p>
            
            <div className="flex flex-col items-center">
              <div className="h-1 w-12 bg-blue-100 mb-3 rounded-full"></div>
              <div className="text-base md:text-lg font-black text-blue-600">
                — {author}
              </div>
              {year && (
                <div className="text-xs md:text-sm text-slate-400 font-bold mt-1">
                  ({year})
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full space-y-3 md:space-y-4">
          {type === 'lost' && onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>נסה שוב (אותו שלב)</span>
            </button>
          )}

          <button
            onClick={onAction}
            className={`w-full py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
              type === 'won' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
            }`}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>{type === 'won' ? 'עבור לשלב הבא' : 'נסה שלב חדש'}</span>
          </button>

          {showRevealButton && (
            <button
              onClick={onReveal}
              className="w-full py-3 md:py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base border border-slate-200"
            >
              <i className="fa-solid fa-eye"></i>
              חשוף פתרון
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
