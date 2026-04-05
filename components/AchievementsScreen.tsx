
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
  
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);

  const uniqueAuthorsCount = useMemo(() => {
    const authors = new Set(stats.usedQuotes.map(q => q.author));
    return authors.size;
  }, [stats.usedQuotes]);

  const categories: AchievementCategory[] = [
    {
      id: 'streak',
      title: 'רצף ניצחונות',
      icon: 'fa-fire',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      currentValue: stats.careerBestStreak || 0,
      tiers: [
        { id: 'streak_3', label: 'ארד', target: 3, reward: 1 },
        { id: 'streak_7', label: 'כסף', target: 7, reward: 1 },
        { id: 'streak_15', label: 'זהב', target: 15, reward: 1 },
        { id: 'streak_30', label: 'פלטינה', target: 30, reward: 1 },
        { id: 'streak_50', label: 'יהלום', target: 50, reward: 1 },
      ]
    },
        {
      id: 'daily_streak',
      title: 'המתמיד היומי',
      icon: 'fa-calendar-check',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      currentValue: stats.bestDailyStreak || 0,
      tiers: [
        { id: 'daily_streak_3', label: 'ארד', target: 3, reward: 1 },
        { id: 'daily_streak_7', label: 'כסף', target: 7, reward: 1 },
        { id: 'daily_streak_14', label: 'זהב', target: 14, reward: 1 },
        { id: 'daily_streak_30', label: 'פלטינה', target: 30, reward: 1 },
      ]
    },
    {
      id: 'no_hints',
      title: 'מוח עצמאי (פתרונות ללא רמזים)',
      icon: 'fa-brain',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      currentValue: stats.winsWithoutHints || 0,
      tiers: [
        { id: 'no_hints_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'no_hints_20', label: 'כסף', target: 20, reward: 1 },
        { id: 'no_hints_50', label: 'זהב', target: 50, reward: 1 },
        { id: 'no_hints_100', label: 'פלטינה', target: 100, reward: 1 },
      ]
    },
    {
      id: 'marathon',
      title: 'מרתון',
      icon: 'fa-person-running',
      color: 'text-red-600',
      bg: 'bg-red-50',
      currentValue: stats.bestMarathon || 0,
      tiers: [
        { id: 'marathon_5', label: 'ארד', target: 5, reward: 1 },
        { id: 'marathon_10', label: 'כסף', target: 10, reward: 1 },
        { id: 'marathon_20', label: 'זהב', target: 20, reward: 1 },
      ]
    },
    {
      id: 'level',
      title: 'התקדמות בשלבים',
      icon: 'fa-trophy',
      color: 'text-blue-600',
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
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      currentValue: stats.careerPerfectGames || 0,
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
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      currentValue: stats.careerWins || 0,
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
      title: 'אלוף הקושי (כמות פתרונות ברמות קשה וקשה מאוד)',
      icon: 'fa-bolt',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      currentValue: (stats.careerHardWins || 0) + (stats.careerVeryHardWins || 0),
      tiers: [
        { id: 'diff_5', label: '5', target: 5, reward: 1 },
        { id: 'diff_15', label: '15', target: 15, reward: 1 },
        { id: 'diff_30', label: '30', target: 30, reward: 1 },
        { id: 'diff_60', label: '60', target: 60, reward: 1 },
      ]
    },
    {
      id: 'collector',
      title: 'היסטוריון (מקורות שונים)',
      icon: 'fa-book-open',
      color: 'text-amber-700',
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
  
  const genreCategories: AchievementCategory[] = [
    {
      id: 'genre_proverb',
      title: 'חובב פתגמים',
      icon: 'fa-comment-dots',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      currentValue: stats.winsByCategory?.['proverb'] || 0,
      tiers: [
        { id: 'genre_proverb_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_proverb_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_proverb_50', label: 'זהב', target: 50, reward: 1 },
      ]
    },
    {
      id: 'genre_song',
      title: 'חובב שירים',
      icon: 'fa-music',
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      currentValue: stats.winsByCategory?.['song'] || 0,
      tiers: [
        { id: 'genre_song_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_song_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_song_50', label: 'זהב', target: 50, reward: 1 },
      ]
    },
    {
      id: 'genre_source',
      title: 'חובב מקורות',
      icon: 'fa-scroll',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      currentValue: stats.winsByCategory?.['source'] || 0,
      tiers: [
        { id: 'genre_source_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_source_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_source_50', label: 'זהב', target: 50, reward: 1 },
      ]
    },
    {
      id: 'genre_famous',
      title: 'חובב ציטוטים מפורסמים',
      icon: 'fa-quote-right',
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      currentValue: stats.winsByCategory?.['famous'] || 0,
      tiers: [
        { id: 'genre_famous_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_famous_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_famous_50', label: 'זהב', target: 50, reward: 1 },
      ]
    },
    {
      id: 'genre_sports',
      title: 'חובב ספורט',
      icon: 'fa-basketball',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      currentValue: stats.winsByCategory?.['sports'] || 0,
      tiers: [
        { id: 'genre_sports_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_sports_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_sports_50', label: 'זהב', target: 50, reward: 1 },
      ]
    },
    {
      id: 'genre_cinema',
      title: 'חובב קולנוע',
      icon: 'fa-film',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      currentValue: stats.winsByCategory?.['cinema'] || 0,
      tiers: [
        { id: 'genre_cinema_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'genre_cinema_25', label: 'כסף', target: 25, reward: 1 },
        { id: 'genre_cinema_50', label: 'זהב', target: 50, reward: 1 },
      ]
    }
  ];

  const handleClaimClick = (id: string) => {
    setAnimatingId(id);
    onClaim(id);
    setTimeout(() => setAnimatingId(null), 1000);
  };

  const getTierIconStyle = (tIdx: number, isAchieved: boolean, isClaimed: boolean) => {
    if (isClaimed) return 'bg-green-600 text-white border-green-700 scale-90 opacity-90';
    if (!isAchieved) return 'bg-white text-slate-300 border-slate-200';
    
    switch (tIdx) {
      case 0: return 'bg-orange-100 text-orange-700 border-orange-300'; // Bronze
      case 1: return 'bg-slate-100 text-slate-700 border-slate-300'; // Silver
      case 2: return 'bg-amber-100 text-amber-700 border-amber-400'; // Gold
      case 3: return 'bg-indigo-100 text-indigo-700 border-indigo-400'; // Platinum
      case 4: return 'bg-cyan-100 text-cyan-700 border-cyan-400'; // Diamond
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getAchievementDescription = (categoryId: string, target: number) => {
        if (categoryId.startsWith('genre_')) {
      return `נצח ${target} משחקים בקטגוריה זו`;
    }
    switch (categoryId) {
      case 'streak': return `השלם ${target} משחקים ברצף ללא הפסד`;
      case 'daily_streak': return `פתור את החידון היומי ${target} ימים ברצף`;
      case 'no_hints': return `נצח ${target} משחקים ללא שימוש ברמזים כלל`;
      case 'marathon': return `נצח ${target} משחקים באותו היום`;
      case 'level': return `הגע לשלב ${target} במשחק`;
      case 'perfect': return `נצח ${target} משחקים ללא טעויות כלל`;
      case 'total_wins': return `צבור ${target} ניצחונות בסך הכל`;
      case 'difficulty': return `נצח ${target} משחקים ברמה קשה או קשה מאוד`;
      case 'collector': return `פתור ציטוטים של ${target} מחברים שונים`;
      default: return `הגע ליעד של ${target}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0 bg-white shadow-sm z-10 border-b border-slate-200">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-slate-800 border border-slate-200 hover:bg-gray-100 transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800">הישגים</h2>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
          <i className="fa-solid fa-lightbulb text-amber-600 text-base"></i>
          <span className="font-black text-amber-800 text-base">{stats.hintsRemaining}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-xs font-bold text-center mb-2">
          שימו לב: הישגי קריירה מתקדמים רק במשחקי שלבים רגילים.
        </div>

        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-[2.5rem] p-2.5 shadow-sm border border-slate-200">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${cat.bg} ${cat.color} border-slate-100`}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{cat.title}</h3>
                  <div className="text-sm text-slate-600 font-bold uppercase tracking-wider">
                    שיא: <span className={`${cat.color} font-black`}>{cat.currentValue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Milestones Track */}
            <div className="flex items-start justify-between relative px-2">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>
              
              {cat.tiers.map((tier, tIdx) => {
                const isAchieved = cat.currentValue >= tier.target;
                const isClaimed = stats.claimedAchievements.includes(tier.id);
                const canClaim = isAchieved && !isClaimed;
                const isAnimating = animatingId === tier.id;
                
                return (
                  <div 
                    key={tier.id}
                    className="flex flex-col items-center gap-2.5 z-10 relative group"
                    onClick={() => canClaim && handleClaimClick(tier.id)}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-32 bg-slate-800 text-white text-xs rounded-lg p-2 text-center shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                      <div className="font-bold mb-1">{tier.label}</div>
                      <div>{getAchievementDescription(cat.id, tier.target)}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>

                    {/* Badge */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                      getTierIconStyle(tIdx, isAchieved, isClaimed)
                    } ${canClaim ? 'animate-bounce cursor-pointer shadow-lg ring-4 ring-amber-100' : ''} ${isAnimating ? 'animate-claim-pop' : ''}`}>
                      
                      {isClaimed ? (
                        <i className="fa-solid fa-check text-base"></i>
                      ) : (
                        <span className="text-sm font-black">{tier.label[0]}</span>
                      )}

                      {!isClaimed && isAchieved && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-[12px] animate-pulse border-2 border-white shadow-sm">
                          <i className="fa-solid fa-lightbulb"></i>
                        </div>
                      )}

                      {isAnimating && (
                        <div className="absolute -top-12 flex items-center justify-center pointer-events-none w-20">
                          <div className="bg-amber-500 text-white rounded-full px-3 py-1 text-[13px] font-black animate-float-hint shadow-xl flex items-center gap-1">
                            <span>+1</span>
                            <i className="fa-solid fa-lightbulb"></i>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <span className={`text-[12px] font-black ${isAchieved ? 'text-slate-800' : 'text-slate-500'}`}>
                        {tier.target}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Collapsible Genres Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setIsGenresExpanded(!isGenresExpanded)}
            className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border bg-indigo-50 text-indigo-600 border-slate-100">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="text-right">
                <h3 className="font-black text-slate-800 text-base">חובב ז'אנרים</h3>
                <div className="text-sm text-slate-600 font-bold">הישגים לפי קטגוריות</div>
              </div>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-300 ${isGenresExpanded ? 'rotate-180' : ''}`}></i>
          </button>
          
          {isGenresExpanded && (
            <div className="p-5 border-t border-slate-100 space-y-6 bg-white">
              {genreCategories.map((cat) => (
                <div key={cat.id} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${cat.bg} ${cat.color} border-slate-100`}>
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{cat.title}</h4>
                      <div className="text-xs text-slate-500 font-bold">
                        שיא: <span className={`${cat.color}`}>{cat.currentValue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between relative px-2">
                    <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 -z-0"></div>
                    
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
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-32 bg-slate-800 text-white text-xs rounded-lg p-2 text-center shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                            <div className="font-bold mb-1">{tier.label}</div>
                            <div>{getAchievementDescription(cat.id, tier.target)}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                          </div>

                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                            getTierIconStyle(tIdx, isAchieved, isClaimed)
                          } ${canClaim ? 'animate-bounce cursor-pointer shadow-lg ring-4 ring-amber-100' : ''} ${isAnimating ? 'animate-claim-pop' : ''}`}>
                            
                            {isClaimed ? (
                              <i className="fa-solid fa-check text-sm"></i>
                            ) : (
                              <span className="text-xs font-black">{tier.label[0]}</span>
                            )}

                            {!isClaimed && isAchieved && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] animate-pulse border-2 border-white shadow-sm">
                                <i className="fa-solid fa-lightbulb"></i>
                              </div>
                            )}

                            {isAnimating && (
                              <div className="absolute -top-10 flex items-center justify-center pointer-events-none w-16">
                                <div className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-[11px] font-black animate-float-hint shadow-xl flex items-center gap-1">
                                  <span>+1</span>
                                  <i className="fa-solid fa-lightbulb"></i>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center">
                            <span className={`text-[11px] font-black ${isAchieved ? 'text-slate-800' : 'text-slate-400'}`}>
                              {tier.target}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {cat !== genreCategories[genreCategories.length - 1] && <div className="h-px bg-slate-100 mt-6"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pt-8 opacity-70 text-sm font-bold text-slate-700 uppercase tracking-widest pb-8">
           הישגים מזכים ברמזים לצמיתות
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
