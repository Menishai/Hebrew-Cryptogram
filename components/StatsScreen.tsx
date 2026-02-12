
import React, { useMemo } from 'react';
import { Statistics } from '../types';

interface StatsScreenProps {
  stats: Statistics;
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onBack }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  
  const accuracyRate = useMemo(() => {
    if (stats.gamesWon === 0) return 0;
    return Math.round((stats.perfectGames / stats.gamesWon) * 100);
  }, [stats.perfectGames, stats.gamesWon]);

  const uniqueAuthorsCount = useMemo(() => {
    return new Set(stats.usedQuotes.map(q => q.author)).size;
  }, [stats.usedQuotes]);

  const avgMistakesPerGame = useMemo(() => {
    if (stats.gamesPlayed === 0) return 0;
    return (stats.totalMistakes / stats.gamesPlayed).toFixed(1);
  }, [stats.totalMistakes, stats.gamesPlayed]);

  // Skill Rating Logic: Based on Level, Perfect Games, and Challenge wins
  const skillRating = useMemo(() => {
    const levelWeight = stats.currentLevel * 10;
    const perfectionWeight = stats.perfectGames * 25;
    const challengeWeight = (stats.hardWinsCount * 15) + (stats.veryHardWinsCount * 30);
    return Math.floor(levelWeight + perfectionWeight + challengeWeight);
  }, [stats]);

  const calculateMilestone = (current: number, step: number) => {
    const next = (Math.floor(current / step) + 1) * step;
    return next;
  };

  const rewardGoals = [
    { label: 'רמה קלה', current: stats.easyWinsCount || 0, step: 10, color: 'bg-green-500' },
    { label: 'רמה בינונית', current: stats.mediumWinsCount || 0, step: 5, color: 'bg-blue-500' },
    { label: 'רמה קשה', current: stats.hardWinsCount || 0, step: 2, color: 'bg-orange-500' },
    { label: 'קשה מאוד', current: stats.veryHardWinsCount || 0, step: 1, color: 'bg-rose-500' },
  ];

  return (
    <div className="flex flex-col items-center h-full p-4 md:p-6 bg-slate-50 overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 flex-shrink-0">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <h2 className="text-2xl font-black text-slate-800">הנתונים שלי</h2>
        <div className="w-12"></div>
      </div>

      <div className="w-full max-w-md space-y-4 pb-12">
        {/* Advanced Mastery Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <div className="relative mb-4">
             <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl shadow-blue-100 ring-4 ring-blue-50">
               <i className="fa-solid fa-trophy"></i>
             </div>
             <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-9 h-9 rounded-full border-4 border-white flex items-center justify-center font-black text-xs shadow-md">
               Lv{stats.currentLevel}
             </div>
          </div>
          
          <div className="text-2xl font-black text-slate-800 mb-1">מדד מיומנות: {skillRating}</div>
          <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-6">Mastery Score Overview</div>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
               <div className="text-blue-600 font-black text-xl">{accuracyRate}%</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase">דיוק (מושלמים)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
               <div className="text-indigo-600 font-black text-xl">{uniqueAuthorsCount}</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase">מקורות שפגשת</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
               <div className="text-emerald-600 font-black text-xl">{winRate}%</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase">שיעור הצלחה</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
               <div className="text-rose-600 font-black text-xl">{avgMistakesPerGame}</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase">ממוצע טעויות</div>
            </div>
          </div>
        </div>

        {/* Road to Reward Dashboard */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 font-black text-base flex items-center gap-2">
              <i className="fa-solid fa-gift text-amber-600"></i>
              הדרך לרמז הבא
            </h3>
            <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Rewards
            </span>
          </div>
          
          <div className="space-y-4">
            {rewardGoals.map((goal, idx) => {
              const nextMilestone = calculateMilestone(goal.current, goal.step);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">{goal.label}</span>
                    <span className="text-[12px] font-black text-slate-500">{goal.current}/{nextMilestone}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${goal.color} transition-all duration-700 relative`} 
                      style={{ width: `${(goal.current / nextMilestone) * 100}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 shimmer"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak & Totals Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-4 text-slate-800 font-black">
              <i className="fa-solid fa-fire text-orange-600"></i>
              שיאי רצף
           </div>
           <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-slate-800">{stats.currentStreak}</div>
                 <div className="text-sm text-slate-600 font-bold uppercase">רצף נוכחי</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-blue-600">{stats.bestStreak}</div>
                 <div className="text-sm text-slate-600 font-bold uppercase">שיא רצף</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-emerald-600">{stats.perfectGames || 0}</div>
                 <div className="text-sm text-slate-600 font-bold uppercase">מושלמים</div>
              </div>
           </div>
        </div>

        <div className="text-center py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
           נצחונות: {stats.gamesWon} | הפסדים: {stats.gamesLost}
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
