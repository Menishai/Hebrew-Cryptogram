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
        { id: 'streak_3', label: 'ברזל', target: 3, reward: 1 },
        { id: 'streak_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'streak_15', label: 'כסף', target: 15, reward: 1 },
        { id: 'streak_30', label: 'זהב', target: 30, reward: 1 },
        { id: 'streak_50', label: 'פלטינה', target: 50, reward: 1 },
        { id: 'streak_70', label: 'טיטניום', target: 70, reward: 1 },
        { id: 'streak_100', label: 'יהלום', target: 100, reward: 1 },
        { id: 'streak_150', label: 'רובי', target: 150, reward: 2 },
        { id: 'streak_200', label: 'אובסידיאן', target: 200, reward: 2 },
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
        { id: 'streak_3', label: 'ברזל', target: 3, reward: 1 },
        { id: 'streak_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'streak_15', label: 'כסף', target: 15, reward: 1 },
        { id: 'streak_30', label: 'זהב', target: 30, reward: 1 },
        { id: 'streak_50', label: 'פלטינה', target: 50, reward: 1 },
        { id: 'streak_70', label: 'טיטניום', target: 70, reward: 1 },
        { id: 'streak_100', label: 'יהלום', target: 100, reward: 1 },
        { id: 'streak_150', label: 'רובי', target: 150, reward: 2 },
        { id: 'streak_200', label: 'אובסידיאן', target: 200, reward: 3 },
        { id: 'streak_300', label: "דמעות אפאצ'י", target: 300, reward: 3 },
      ]
    },
    {
      id: 'no_hints',
      title: 'מוח עצמאי (ללא רמזים)',
      icon: 'fa-brain',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      currentValue: stats.winsWithoutHints || 0,
      tiers: [
        { id: 'no_hints_10', label: 'ארד', target: 10, reward: 1 },
        { id: 'no_hints_20', label: 'כסף', target: 20, reward: 1 },
        { id: 'no_hints_50', label: 'זהב', target: 50, reward: 1 },
        { id: 'no_hints_75', label: 'פלטינה', target: 75, reward: 1 },
        { id: 'streak_100', label: 'טיטניום', target: 100, reward: 1 },
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
        { id: 'streak_30', label: 'פלטינה', target: 30, reward: 1 },
        { id: 'streak_50', label: 'טיטניום', target: 50, reward: 1 },
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
        { id: 'perfect_1', label: 'סקרן', target: 1, reward: 1 },
        { id: 'perfect_5', label: 'חד', target: 5, reward: 1 },
        { id: 'perfect_20', label: 'מבריק', target: 20, reward: 1 },
        { id: 'perfect_50', label: '50', target: 50, reward: 1 },
        { id: 'perfect_100', label: 'גאון', target: 100, reward: 2 },
        { id: 'perfect_150', label: 'עילוי', target: 150, reward: 2 },
        { id: 'perfect_300', label: 'מוח-על', target: 300, reward: 5 },
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
        { id: 'total_10', label: 'חובבן', target: 10, reward: 1 },
        { id: 'total_25', label: 'חוקר', target: 25, reward: 1 },
        { id: 'total_50', label: 'מפענח', target: 50, reward: 1 },
        { id: 'total_100', label: 'מומחה', target: 100, reward: 1 },
        { id: 'total_150', label: 'רב-אומן', target: 150, reward: 2 },
        { id: 'total_200', label: 'מאסטר', target: 200, reward: 2 },
        { id: 'total_300', label: 'אלוף הצופן', target: 300, reward: 3 },
      ]
    },
    {
      id: 'difficulty',
      title: 'אלוף הקושי (קשה וקשה מאוד)',
      icon: 'fa-bolt',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      currentValue: (stats.careerHardWins || 0) + (stats.careerVeryHardWins || 0),
      tiers: [
        { id: 'diff_5', label: 'חובבן', target: 5, reward: 1 },
        { id: 'diff_15', label: 'חוקר', target: 15, reward: 1 },
        { id: 'diff_30', label: 'מפענח', target: 30, reward: 1 },
        { id: 'diff_50', label: 'מומחה', target: 50, reward: 1 },
        { id: 'diff_80', label: 'רב-אומן', target: 80, reward: 2 },
        { id: 'diff_100', label: 'מאסטר', target: 100, reward: 2 },
        { id: 'diff_150', label: 'אלוף הצופן', target: 150, reward: 2 },
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
      title: 'חובב ציטוטים',
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

  const getAchievementDescription = (categoryId: string, target: number) => {
    if (categoryId.startsWith('genre_')) {
      return `נצח ${target} משחקים בקטגוריה זו`;
    }
    switch (categoryId) {
      case 'streak': return `השלם ${target} משחקים ברצף ללא הפסד`;
      case 'daily_streak': return `פתור את החידון היומי ${target} ימים ברצף`;
      case 'no_hints': return `נצח ${target} משחקים ללא שימוש ברמזים`;
      case 'marathon': return `נצח ${target} משחקים באותו היום`;
      case 'level': return `הגע לשלב ${target} במשחק`;
      case 'perfect': return `נצח ${target} משחקים ללא טעויות כלל`;
      case 'total_wins': return `צבור ${target} ניצחונות בסך הכל`;
      case 'difficulty': return `נצח ${target} ברמה קשה / קשה מאוד`;
      case 'collector': return `פתור ציטוטים של ${target} מחברים שונים`;
      default: return `הגע ליעד של ${target}`;
    }
  };

  // The Magic Function: Renders a clean "Focused Roadmap" for any category
const renderCategoryCard = (cat: AchievementCategory) => {
    const firstUnclaimedIndex = cat.tiers.findIndex(t => !stats.claimedAchievements.includes(t.id));
    const isMaxedOut = firstUnclaimedIndex === -1;
    
    let activeTier = null;
    let previousTier = null;
    let futureTiers: AchievementTier[] = [];
    let isReadyToClaim = false;
    let progressPercent = 0;

    if (!isMaxedOut) {
      activeTier = cat.tiers[firstUnclaimedIndex];
      previousTier = firstUnclaimedIndex > 0 ? cat.tiers[firstUnclaimedIndex - 1] : null;
      
      // שינוי: לוקחים עד 4 רמות עתידיות (slice של 5)
      futureTiers = cat.tiers.slice(firstUnclaimedIndex + 1, firstUnclaimedIndex + 5);
      
      isReadyToClaim = cat.currentValue >= activeTier.target;
      const prevTarget = previousTier ? previousTier.target : 0;
      const safeCurrent = Math.max(prevTarget, Math.min(cat.currentValue, activeTier.target));
      progressPercent = isReadyToClaim ? 100 : ((safeCurrent - prevTarget) / (activeTier.target - prevTarget)) * 100;
    }

    return (
      <div key={cat.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-200 mb-4 transition-all">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${cat.bg} ${cat.color} border-slate-100`}>
            <i className={`fa-solid ${cat.icon}`}></i>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-slate-800 text-base">{cat.title}</h3>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              שיא נוכחי: <span className={`${cat.color} font-black text-sm`}>{cat.currentValue}</span>
            </div>
          </div>
        </div>

        {isMaxedOut ? (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
            <p className="font-black text-slate-400 text-sm">👑 הושלמו כל ההישגים בקטגוריה!</p>
          </div>
        ) : isReadyToClaim ? (
          <div className="mt-2 bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
            <div className="pr-3">
              <p className="text-amber-900 font-black text-sm mb-0.5">השגת: {activeTier!.label}!</p>
              <p className="text-amber-700 text-[10px] font-bold">{getAchievementDescription(cat.id, activeTier!.target)}</p>
            </div>
            <button 
              onClick={() => handleClaimClick(activeTier!.id)} 
              className="shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all animate-pulse"
            >
              קבל {activeTier!.reward} <i className="fa-solid fa-lightbulb"></i>
            </button>
            {animatingId === activeTier!.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="bg-amber-500 text-white rounded-full px-4 py-1 text-sm font-black animate-float-hint shadow-xl flex items-center gap-2">
                  <span>+{activeTier!.reward}</span>
                  <i className="fa-solid fa-lightbulb"></i>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">היעד הבא: <span className="text-slate-700">{activeTier!.label}</span></p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{getAchievementDescription(cat.id, activeTier!.target)}</p>
              </div>
              {/* תיקון המספרים: הוספת dir="ltr" */}
              <p className="text-sm font-black text-slate-700 shrink-0 mr-2" dir="ltr">
                {cat.currentValue} <span className="text-[10px] text-slate-400 font-medium">/ {activeTier!.target}</span>
              </p>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full ${cat.color} bg-current rounded-full transition-all duration-1000 ease-out relative`}
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-transparent via-white/40 to-transparent translate-x-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* האופק: הטיזר המורחב עם הטשטוש */}
        {!isMaxedOut && futureTiers.length > 0 && (
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
            <p className="text-[10px] text-slate-400 font-bold shrink-0 uppercase tracking-widest">בהמשך:</p>
            <div className="flex gap-2 overflow-hidden relative w-full">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10"></div>
              {futureTiers.map((tier, index) => {
                // בדיקה אם זה האיבר הרביעי (האחרון ברשימת הטיזרים)
                const isLastTeaser = index === 3;
                
                return (
                  <div 
                    key={tier.id} 
                    className={`flex items-center gap-1.5 shrink-0 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 transition-all ${
                      isLastTeaser ? 'opacity-25 blur-[0.4px] scale-95' : 'opacity-50'
                    }`}
                  >
                    <i className="fa-solid fa-lock text-[8px] text-slate-400"></i>
                    <span className="text-[10px] font-bold text-slate-600">{tier.label}</span>
                    <span className="text-[9px] font-medium text-slate-400">{tier.target}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-5 flex-shrink-0 bg-white shadow-sm z-10 border-b border-slate-200 safe-large-header-spacing">
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

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-xs font-bold text-center mb-5 shadow-sm">
          שימו לב: הישגי קריירה מתקדמים רק במשחקי שלבים רגילים.
        </div>

        {/* Main Categories */}
        {categories.map((cat) => renderCategoryCard(cat))}
        
        {/* Collapsible Genres Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mt-6">
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
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              {genreCategories.map((cat) => renderCategoryCard(cat))}
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