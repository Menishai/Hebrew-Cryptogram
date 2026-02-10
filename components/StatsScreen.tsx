
import React from 'react';
import { Statistics } from '../types';

interface StatsScreenProps {
  stats: Statistics;
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onBack }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const calculateMilestone = (current: number, step: number) => {
    const next = (Math.floor(current / step) + 1) * step;
    return next;
  };

  const rewardGoals = [
    { label: 'רמה קלה', current: stats.easyWinsCount || 0, step: 10, color: 'bg-green-500' },
    { label: 'רמה בינונית', current: stats.mediumWinsCount || 0, step: 5, color: 'bg-blue-500' },
    { label: 'רמה קשה', current: stats.hardWinsCount || 0, step: 2, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex flex-col items-center h-full p-4 md:p-6 bg-slate-50 overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 flex-shrink-0">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-black text-slate-800">הנתונים שלי</h2>
        <div className="w-12"></div>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Main Stats Summary */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-4">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div className="text-4xl font-black text-slate-800 mb-1">{stats.currentLevel || 1}</div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">שלב נוכחי</div>
          
          <div className="grid grid-cols-3 gap-8 w-full mt-8 border-t border-slate-50 pt-6">
            <div>
               <div className="text-xl font-black text-slate-800">{stats.gamesWon}</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase">נצחונות</div>
            </div>
            <div>
               <div className="text-xl font-black text-blue-500">{winRate}%</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase">הצלחה</div>
            </div>
            <div>
               <div className="text-xl font-black text-rose-500">{stats.gamesLost}</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase">הפסדים</div>
            </div>
          </div>
        </div>

        {/* Hints Progress Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 font-black text-base flex items-center gap-2">
              <i className="fa-solid fa-gift text-amber-500"></i>
              הדרך לרמז הבא
            </h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              צבור רמזים כפרס
            </span>
          </div>
          
          <div className="space-y-4">
            {rewardGoals.map((goal, idx) => {
              const nextMilestone = calculateMilestone(goal.current, goal.step);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600">{goal.label}</span>
                    <span className="text-[10px] font-black text-slate-400">{goal.current}/{nextMilestone}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${goal.color} transition-all duration-700`} 
                      style={{ width: `${(goal.current / nextMilestone) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2">
              <div className="bg-amber-50 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-white text-xs">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="text-[10px] font-bold text-amber-700 leading-tight">
                  ניצחון ברמה <span className="font-black">קשה מאוד</span> מעניק רמז מיידי!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streaks Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-4 text-slate-800 font-black">
              <i className="fa-solid fa-fire text-orange-500"></i>
              רצף נצחונות
           </div>
           <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-slate-800">{stats.currentStreak}</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase">רצף נוכחי</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-blue-500">{stats.bestStreak}</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase">הכי טוב</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center flex-1">
                 <div className="text-2xl font-black text-emerald-500">{stats.perfectGames || 0}</div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase">משחקים מושלמים</div>
              </div>
           </div>
        </div>

        <div className="text-center py-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
           סה"כ משחקים: {stats.gamesPlayed}
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
