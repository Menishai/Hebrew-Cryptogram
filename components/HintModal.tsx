
import React from 'react';

interface HintModalProps {
  onRevealLetter: () => void;
  onRevealAuthor: () => void;
  onRevealLocked: () => void;
  onCancel: () => void;
  isAuthorRevealed: boolean;
  hintsRemaining: number;
  hasLockedCells: boolean;
}

const HintModal: React.FC<HintModalProps> = ({ 
  onRevealLetter, 
  onRevealAuthor, 
  onRevealLocked,
  onCancel, 
  isAuthorRevealed,
  hintsRemaining,
  hasLockedCells
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm bg-black/20" onClick={onCancel} dir="rtl">
      <div 
        className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xl font-black text-slate-800">בחר רמז</h3>
           <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
             נותרו: {hintsRemaining}
           </div>
        </div>

        {/* Standard Reveal Letter */}
        <button 
          onClick={onRevealLetter}
          className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-right"
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 text-xl group-hover:scale-110 transition-transform shadow-sm">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800">חשוף אות</div>
            <div className="text-xs text-slate-400">בחר משבצת בלוח כדי לגלות את האות</div>
          </div>
        </button>

        {/* Reveal Locked Letter */}
        <button 
          onClick={onRevealLocked}
          disabled={!hasLockedCells}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right ${
            !hasLockedCells 
              ? 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-100 hover:border-amber-200 hover:bg-amber-50 group cursor-pointer'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-sm ${
            !hasLockedCells 
              ? 'bg-slate-100 text-slate-400 border-slate-200' 
              : 'bg-white border-slate-200 text-amber-500 group-hover:scale-110 transition-transform'
          }`}>
            <i className="fa-solid fa-lock-open"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800">חשוף אות נעולה</div>
            <div className="text-xs text-slate-400">
              {hasLockedCells ? 'פתח משבצת נעולה באופן אקראי' : 'אין אותיות נעולות בשלב זה'}
            </div>
          </div>
        </button>

        {/* Reveal Author/Source */}
        <button 
          onClick={onRevealAuthor}
          disabled={isAuthorRevealed}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right ${
            isAuthorRevealed 
              ? 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-100 hover:border-purple-200 hover:bg-purple-50 group cursor-pointer'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-sm ${
            isAuthorRevealed 
              ? 'bg-slate-100 text-slate-400 border-slate-200' 
              : 'bg-white border-slate-200 text-purple-500 group-hover:scale-110 transition-transform'
          }`}>
            <i className="fa-solid fa-user-pen"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800">
              {isAuthorRevealed ? 'המקור נחשף' : 'חשוף את המקור'}
            </div>
            <div className="text-xs text-slate-400">
              {isAuthorRevealed ? 'כבר השתמשת ברמז זה' : 'גלה מי אמר את הציטוט בתחתית המסך'}
            </div>
          </div>
          {isAuthorRevealed && <i className="fa-solid fa-check text-green-500 ml-2"></i>}
        </button>

        <button 
          onClick={onCancel}
          className="mt-2 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
        >
          ביטול
        </button>
      </div>
    </div>
  );
};

export default HintModal;
