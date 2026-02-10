
import React, { useState } from 'react';
import { Statistics } from '../types';

interface AchievementsScreenProps {
  stats: Statistics;
  onBack: () => void;
  onClaim: (id: string) => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ stats, onBack, onClaim }) => {
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const milestones = [
    // Streaks
    { id: 'streak_3', label: 'רצף בסיסי', desc: '3 נצחונות רצופים', icon: 'fa-fire', achieved: stats.bestStreak >= 3, color: 'text-orange-400', bg: 'bg-orange-50' },
    { id: 'streak_6', label: 'רצף רציני', desc: '6 נצחונות רצופים', icon: 'fa-fire-flame-curved', achieved: stats.bestStreak >= 6, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'streak_12', label: 'בוער!', desc: '12 נצחונות רצופים', icon: 'fa-fire-flame-simple', achieved: stats.bestStreak >= 12, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'streak_25', label: 'בלתי עציר', desc: '25 נצחונות רצופים', icon: 'fa-volcano', achieved: stats.bestStreak >= 25, color: 'text-red-700', bg: 'bg-red-100' },
    
    // Levels
    { id: 'level_10', label: 'התחלה מבטיחה', desc: 'הגעת לשלב 10', icon: 'fa-medal', achieved: (stats.currentLevel || 1) >= 10, color: 'text-blue-400', bg: 'bg-blue-50' },
    { id: 'level_30', label: 'מפענח מתקדם', desc: 'הגעת לשלב 30', icon: 'fa-award', achieved: (stats.currentLevel || 1) >= 30, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'level_60', label: 'מומחה הצפנים', desc: 'הגעת לשלב 60', icon: 'fa-ranking-star', achieved: (stats.currentLevel || 1) >= 60, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'level_100', label: 'אגדה חיה', desc: 'הגעת לשלב 100!', icon: 'fa-crown', achieved: (stats.currentLevel || 1) >= 100, color: 'text-amber-500', bg: 'bg-amber-100' },
    
    // Perfection (Zero mistakes)
    { id: 'perfect_1', label: 'דיוק ראשון', desc: 'שלב אחד ללא טעויות', icon: 'fa-bullseye', achieved: (stats.perfectGames || 0) >= 1, color: 'text-emerald-400', bg: 'bg-emerald-50' },
    { id: 'perfect_10', label: 'צלף מילים', desc: '10 שלבים ללא טעויות', icon: 'fa-crosshairs', achieved: (stats.perfectGames || 0) >= 10, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'perfect_25', label: 'שלמות היא שם המשחק', desc: '25 שלבים מושלמים', icon: 'fa-circle-check', achieved: (stats.perfectGames || 0) >= 25, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'perfect_50', label: 'מכונה משומנת', desc: '50 שלבים מושלמים!', icon: 'fa-gem', achieved: (stats.perfectGames || 0) >= 50, color: 'text-cyan-500', bg: 'bg-cyan-50' },

    // Total Wins
    { id: 'total_10', label: 'חניך', desc: '10 נצחונות סה"כ', icon: 'fa-user-graduate', achieved: stats.gamesWon >= 10, color: 'text-slate-500', bg: 'bg-slate-100' },
    { id: 'total_50', label: 'מקצוען', desc: '50 נצחונות סה"כ', icon: 'fa-star', achieved: stats.gamesWon >= 50, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  ];

  const handleClaimClick = (id: string) => {
    setAnimatingId(id);
    onClaim(id);
    setTimeout(() => setAnimatingId(null), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 flex-shrink-0 bg-white shadow-sm z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-slate-600 hover:bg-gray-100 transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-black text-slate-800">הישגים</h2>
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100 shadow-sm">
          <i className="fa-solid fa-lightbulb text-amber-500 text-sm"></i>
          <span className="font-black text-amber-700 text-sm">{stats.hintsRemaining}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20">
        {/* Milestone Badges */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest text-right">אבני דרך ומדרגות</h3>
            <span className="text-[10px] font-black text-slate-400">
              {milestones.filter(m => m.achieved).length} / {milestones.length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {milestones.map((m) => {
              const isClaimed = stats.claimedAchievements.includes(m.id);
              const canClaim = m.achieved && !isClaimed;
              const isAnimating = animatingId === m.id;

              return (
                <button 
                  key={m.id} 
                  disabled={!canClaim}
                  onClick={() => handleClaimClick(m.id)}
                  className={`p-4 rounded-[2rem] flex flex-col items-center text-center border-2 transition-all duration-500 relative overflow-hidden ${
                    m.achieved 
                      ? `${m.bg} ${canClaim ? 'border-amber-400 shadow-amber-100 animate-pulse cursor-pointer' : 'border-transparent shadow-sm'} scale-100` 
                      : 'bg-white border-slate-50 opacity-40 scale-95 cursor-default'
                  } ${isAnimating ? 'animate-claim-pop ring-4 ring-amber-300 ring-opacity-50' : ''}`}
                >
                  {isAnimating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-amber-400 text-white rounded-full px-4 py-1.5 text-xs font-black animate-float-hint shadow-xl flex items-center gap-1.5">
                        <span>+1</span>
                        <i className="fa-solid fa-lightbulb"></i>
                      </div>
                    </div>
                  )}

                  {m.achieved && (
                    <div className={`absolute top-2 left-2 text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white ${
                      isClaimed ? 'bg-green-500 text-white' : 'bg-amber-400 text-white animate-bounce'
                    }`}>
                      <i className={`fa-solid ${isClaimed ? 'fa-check' : 'fa-gift'}`}></i>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 ${m.achieved ? m.color : 'text-slate-200'}`}>
                    <i className={`fa-solid ${m.icon}`}></i>
                  </div>
                  <div className="font-black text-slate-800 text-[13px] mb-1 leading-tight">{m.label}</div>
                  <div className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-2">
                    {canClaim ? 'לחץ לקבלת רמז!' : m.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Discovered Quotes */}
        <section>
          <div className="flex items-center justify-between px-2 mb-4">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest text-right">ציטוטים שפענחת</h3>
             <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{stats.usedQuotes.length}</span>
          </div>
          
          {stats.usedQuotes.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center text-center border-2 border-dashed border-slate-200">
               <div className="w-14 h-14 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center text-xl mb-3">
                  <i className="fa-solid fa-quote-left"></i>
               </div>
               <p className="text-slate-400 font-bold text-sm">היסטוריית הציטוטים שלך ריקה.<br/>השלם שלב כדי להתחיל לאסוף!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.usedQuotes.map((quoteObj, idx) => (
                <div key={idx} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50 relative group text-right">
                  <p className="text-slate-700 font-bold text-sm leading-relaxed mb-2">
                    "{quoteObj.text}"
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                    <span className="text-[10px] text-blue-600 font-black">
                      {quoteObj.author}
                    </span>
                    {quoteObj.year && (
                      <span className="text-[9px] text-slate-300 font-bold tracking-tighter">
                        {quoteObj.year}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AchievementsScreen;
