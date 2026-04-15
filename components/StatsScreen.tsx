
import React, { useMemo, useState } from 'react';
import { Statistics } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsScreenProps {
  stats: Statistics;
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'collection'>('overview');
  const [showSkillInfo, setShowSkillInfo] = useState(false);
  
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

  const skillRating = useMemo(() => {
    const levelWeight = stats.currentLevel * 10;
    const perfectionWeight = stats.perfectGames * 25;
    const challengeWeight = (stats.hardWinsCount * 15) + (stats.veryHardWinsCount * 30);
    return Math.floor(levelWeight + perfectionWeight + challengeWeight);
  }, [stats]);
  
  const hintData = useMemo(() => {
    const data = [
      { name: 'גילוי אותיות', value: stats.hintsByType?.letter || 0, color: '#3b82f6' }, // blue-500
      { name: 'גילוי מחבר', value: stats.hintsByType?.author || 0, color: '#a855f7' }, // purple-500
      { name: 'פתיחת נעולים', value: stats.hintsByType?.locked || 0, color: '#f43f5e' }, // rose-500
    ];
    return data.filter(item => item.value > 0);
  }, [stats.hintsByType]);

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
    <div className="flex flex-col items-center h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Skill Rating Explanation Overlay */}
      {showSkillInfo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40" onClick={() => setShowSkillInfo(false)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center relative border-b-8 border-blue-500" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSkillInfo(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
              <i className="fa-solid fa-calculator"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">איך מחושב המדד?</h3>
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black">10</div>
                <div className="text-sm font-bold text-slate-600">נקודות על כל שלב שסיימת</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black">25</div>
                <div className="text-sm font-bold text-slate-600">בונוס על כל משחק מושלם</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-black">15</div>
                <div className="text-sm font-bold text-slate-600">בונוס על ניצחון ברמה קשה</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-black">30</div>
                <div className="text-sm font-bold text-slate-600">בונוס על ניצחון בקשה מאוד</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 md:p-6 bg-white border-b border-slate-200 flex-shrink-0 z-20">
        <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <h2 className="text-xl md:text-2xl font-black text-slate-800">הנתונים שלי</h2>
        <div className="w-10 md:w-12"></div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md px-4 mt-4 mb-2 flex-shrink-0">
        <div className="bg-slate-200/50 p-1.5 rounded-2xl flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            סיכום כללי
          </button>
          <button 
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'collection' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            אוסף הציטוטים ({stats.usedQuotes.length})
          </button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md mx-auto p-4 space-y-4 pb-12">
          
          {activeTab === 'overview' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
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
                
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-2xl font-black text-slate-800">מדד מיומנות: {skillRating}</div>
                  <button 
                    onClick={() => setShowSkillInfo(true)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  >
                    <i className="fa-solid fa-circle-info text-sm"></i>
                  </button>
                </div>
                <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-6">Mastery Score Overview</div>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                     <div className="text-blue-600 font-black text-xl">{accuracyRate}%</div>
                     <div className="text-[11px] text-slate-500 font-bold uppercase">משחקים מושלמים</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                     <div className="text-indigo-600 font-black text-xl">{uniqueAuthorsCount}</div>
                     <div className="text-[11px] text-slate-500 font-bold uppercase">מקורות שפגשת</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                     <div className="text-emerald-600 font-black text-xl">{winRate}%</div>
                     <div className="text-[11px] text-slate-500 font-bold uppercase">שיעור הצלחה</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
                     <div className="text-rose-600 font-black text-xl">{avgMistakesPerGame}</div>
                     <div className="text-[11px] text-slate-500 font-bold uppercase">ממוצע טעויות</div>
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
                    פרסים
                  </span>
                </div>
                
                <div className="space-y-4">
                  {rewardGoals.map((goal, idx) => {
                    const progressInBatch = goal.current % goal.step;
                    const progressPercent = (progressInBatch / goal.step) * 100;
                    
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-slate-700">{goal.label}</span>
                          <span className="text-[12px] font-black text-slate-500">
                            {progressInBatch}/{goal.step}
                          </span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                          {/* Progress Bar */}
                          <div 
                            className={`h-full ${goal.color} transition-all duration-700 relative`} 
                            style={{ width: `${progressPercent}%` }}
                          >
                             <div className="absolute inset-0 bg-white/20 shimmer"></div>
                          </div>
                          
                          {/* Tick Marks */}
                          {goal.step > 1 && Array.from({ length: goal.step - 1 }).map((_, i) => (
                            <div 
                              key={i}
                              className="absolute top-0 bottom-0 w-px bg-white/50 z-10"
                              style={{ left: `${((i + 1) / goal.step) * 100}%` }}
                            ></div>
                          ))}
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
              
              {/* Hint Statistics Card */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 text-slate-800 font-black">
                  <i className="fa-solid fa-lightbulb text-amber-500"></i>
                  שימוש ברמזים
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex flex-col items-center">
                    <div className="text-amber-600 font-black text-2xl">{stats.totalHintsUsed || 0}</div>
                    <div className="text-[10px] text-amber-700 font-bold uppercase">סה"כ רמזים</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center">
                    <div className="text-blue-600 font-black text-2xl">{stats.winsWithoutHints || 0}</div>
                    <div className="text-[10px] text-blue-700 font-bold uppercase">ניצחונות ללא רמז</div>
                  </div>
                </div>

                {hintData.length > 0 && (
                  <div className="h-48 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hintData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {hintData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                          itemStyle={{ color: '#1e293b' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                        <i className="fa-solid fa-font"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">גילוי אותיות</span>
                    </div>
                    <span className="font-black text-slate-800">{stats.hintsByType?.letter || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-500">
                        <i className="fa-solid fa-user-pen"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">גילוי מחבר</span>
                    </div>
                    <span className="font-black text-slate-800">{stats.hintsByType?.author || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-500">
                        <i className="fa-solid fa-lock-open"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">פתיחת נעולים</span>
                    </div>
                    <span className="font-black text-slate-800">{stats.hintsByType?.locked || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
              {stats.usedQuotes.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <i className="fa-solid fa-quote-right text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">אין עדיין ציטוטים</h3>
                  <p className="text-sm text-slate-500 font-medium">השלם שלבים כדי למלא את האוסף שלך!</p>
                </div>
              ) : (
                stats.usedQuotes.map((q, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden group hover:border-blue-200 transition-all hover:shadow-md"
                  >
                    <div className="absolute -top-2 -right-2 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                      <i className="fa-solid fa-quote-right text-6xl"></i>
                    </div>
                    <p className="text-base md:text-lg font-black text-slate-800 mb-3 leading-tight italic">
                      "{q.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-xs md:text-sm font-black text-blue-600">{q.author}</span>
                        {q.year && <span className="text-[10px] text-slate-400 font-bold">({q.year})</span>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs">
                        {stats.usedQuotes.length - idx}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="text-center py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
             נצחונות: {stats.gamesWon} | הפסדים: {stats.gamesLost}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default StatsScreen;
