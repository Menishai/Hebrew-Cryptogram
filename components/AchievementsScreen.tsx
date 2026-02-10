
import React, { useState, useMemo } from 'react';
import { Statistics } from '../types';

interface AchievementTier {
  id: string;
  label: string;
  target: number;
  reward: number;
}

interface AchievementCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  currentValue: number;
  tiers: AchievementTier[];
}

interface AchievementsScreenProps {
  stats: Statistics;
  onBack: () => void;
  onClaim: (id: string) => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ stats, onBack, onClaim }) => {
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const uniqueAuthorsCount = useMemo(() => {
    const authors = new Set(stats.usedQuotes.map(q => q.author));
    return authors.size;
  }, [stats.usedQuotes]);

  const categories: AchievementCategory[] = [
    {
      id: 'streak',
      title: 'רצף ניצחונות',
      icon: 'fa-fire',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      currentValue: stats.bestStreak,
      tiers: [
        { id: 'streak_3', label: 'ארד', target: 3, reward: 1 },
        { id: 'streak_7', label: 'כסף', target: 7, reward: 1 },
        { id: 'streak_15', label: 'זהב', target: 15, reward: 1 },
        { id: 'streak_30', label: 'פלטינה', target: 30, reward: 1 },
        { id: 'streak_50', label: 'יהלום', target: 50, reward: 1 },
      ]
    },
    {
      id: 'level',
      title: 'התקדמות בשלבים',
      icon: 'fa-trophy',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      currentValue: stats.currentLevel - 1,
      tiers: [
        { id: 'level_10', label: 'טירון', target: 10, reward: 1 },
        { id: 'level_25', label: 'מתקדם', target: 25, reward: 1 },
        { id: 'level_50', label: 'מומחה', target: 50, reward: 1 },
        { id: 'level_100', label: 'אמן', target: 100, reward: 1 },
        { id: 'level_250', label: 'אגדה', target: 250, reward: 1 },
      ]
    },
    {
      id: 'perfect',
      title: 'משחקים מושלמים',
      icon: 'fa-bullseye',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      currentValue: stats.perfectGames || 0,
      tiers: [
        { id: 'perfect_1', label: '1', target: 1, reward: 1 },
        { id: 'perfect_5', label: '5', target: 5, reward: 1 },
        { id: 'perfect_20', label: '20', target: 20, reward: 1 },
        { id: 'perfect_50', label: '50', target: 50, reward: 1 },
        { id: 'perfect_100', label: '100', target: 100, reward: 1 },
      ]
    },
    {
      id: 'total_wins',
      title: 'סך הכל ניצחונות',
      icon: 'fa-star',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      currentValue: stats.gamesWon,
      tiers: [
        { id: 'total_10', label: '10', target: 10, reward: 1 },
        { id: 'total_25', label: '25', target: 25, reward: 1 },
        { id: 'total_50', label: '50', target: 50, reward: 1 },
        { id: 'total_100', label: '100', target: 100, reward: 1 },
        { id: 'total_250', label: '250', target: 250, reward: 1 },
      ]
    },
    {
      id: 'difficulty',
      title: 'אלוף הקושי',
      icon: 'fa-bolt',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      currentValue: (stats.hardWinsCount || 0) + (stats.veryHardWinsCount || 0),
      tiers: [
        { id: 'diff_5', label: '5', target: 5, reward: 1 },
        { id: 'diff_15', label: '15', target: 15, reward: 1 },
        { id: 'diff_30', label: '30', target: 30, reward: 1 },
        { id: 'diff_60', label: '60', target: 60, reward: 1 },
      ]
    },
    {
      id: 'collector',
      title: 'היסטוריון',
      icon: 'fa-book-open',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      currentValue: uniqueAuthorsCount,
      tiers: [
        { id: 'coll_5', label: '5', target: 5, reward: 1 },
        { id: 'coll_15', label: '15', target: 15, reward: 1 },
        { id: 'coll_40', label: '40', target: 40, reward: 1 },
        { id: 'coll_80', label: '80', target: 80, reward: 1 },
      ]
    }
  ];

  const handleClaimClick = (id: string) => {
    setAnimatingId(id);
    onClaim(id);
    setTimeout(() => setAnimatingId(null), 1000);
  };

  const getTierIconStyle = (tIdx: number, isAchieved: boolean, isClaimed: boolean) => {
    if (isClaimed) return 'bg-green-500 text-white border-green-600 scale-90 opacity-80';
    if (!isAchieved) return 'bg-white text-slate-200 border-slate-100';
    
    switch (tIdx) {
      case 0: return 'bg-orange-100 text-orange-600 border-orange-200'; // Bronze
      case 1: return 'bg-slate-100 text-slate-600 border-slate-200'; // Silver
      case 2: return 'bg-amber-100 text-amber-600 border-amber-300'; // Gold
      case 3: return 'bg-indigo-100 text-indigo-600 border-indigo-300'; // Platinum
      case 4: return 'bg-cyan-100 text-cyan-600 border-cyan-300'; // Diamond
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 bg-white shadow-sm z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-slate-600 hover:bg-gray-100 transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800">הישגים</h2>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
          <i className="fa-solid fa-lightbulb text-amber-500 text-sm"></i>
          <span className="font-black text-amber-700 text-sm">{stats.hintsRemaining}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cat.bg} ${cat.color}`}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{cat.title}</h3>
                  <div className="text-[10px] text-slate-400 font-bold">
                    שיא: <span className={`${cat.color} font-black`}>{cat.currentValue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Milestones Track */}
            <div className="flex items-start justify-between relative px-1">
              {/* Progress Line */}
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-100 -z-0"></div>
              
              {cat.tiers.map((tier, tIdx) => {
                const isAchieved = cat.currentValue >= tier.target;
                const isClaimed = stats.claimedAchievements.includes(tier.id);
                const canClaim = isAchieved && !isClaimed;
                const isAnimating = animatingId === tier.id;
                
                return (
                  <div 
                    key={tier.id}
                    className="flex flex-col items-center gap-2 z-10 relative group"
                    onClick={() => canClaim && handleClaimClick(tier.id)}
                  >
                    {/* Badge */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                      getTierIconStyle(tIdx, isAchieved, isClaimed)
                    } ${canClaim ? 'animate-bounce cursor-pointer shadow-lg ring-4 ring-amber-100' : ''} ${isAnimating ? 'animate-claim-pop' : ''}`}>
                      
                      {isClaimed ? (
                        <i className="fa-solid fa-check text-sm"></i>
                      ) : (
                        <span className="text-[10px] font-black">{tier.label[0]}</span>
                      )}

                      {/* Reward indicator if unclaimed */}
                      {!isClaimed && isAchieved && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center text-[8px] animate-pulse">
                          <i className="fa-solid fa-lightbulb"></i>
                        </div>
                      )}

                      {/* Floating animation */}
                      {isAnimating && (
                        <div className="absolute -top-10 flex items-center justify-center pointer-events-none w-20">
                          <div className="bg-amber-400 text-white rounded-full px-2 py-0.5 text-[8px] font-black animate-float-hint shadow-xl flex items-center gap-1">
                            <span>+1</span>
                            <i className="fa-solid fa-lightbulb"></i>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Label */}
                    <div className="flex flex-col items-center">
                      <span className={`text-[8px] font-black ${isAchieved ? 'text-slate-600' : 'text-slate-300'}`}>
                        {tier.target}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="text-center pt-4 opacity-40 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           הישגים מזכים ברמזים לצמיתות
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
