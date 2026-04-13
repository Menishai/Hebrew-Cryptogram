
import React, { useState, useEffect } from 'react';
import { DailyDayStats, Difficulty } from '../types';

interface DailyQuizCalendarProps {
  onBack: () => void;
  onSelectDate: (dateStr: string) => void;
  dailyProgress: Record<string, DailyDayStats>;
  initialMonth?: number;
}

const DailyQuizCalendar: React.FC<DailyQuizCalendarProps> = ({ onBack, onSelectDate, dailyProgress, initialMonth }) => {
  const currentRealMonth = new Date().getMonth(); // Feb = 1, March = 2, April = 3
  const defaultMonth = initialMonth !== undefined ? initialMonth : Math.max(1, Math.min(3, currentRealMonth));
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [lockedDateSelected, setLockedDateSelected] = useState<boolean>(false);
  const [timeToNextQuiz, setTimeToNextQuiz] = useState<string>('');

  const months = [
    { name: 'פברואר', days: 28, value: 1 },
    { name: 'מרץ', days: 31, value: 2 },
    { name: 'אפריל', days: 30, value: 3 }
  ];

  const currentMonthData = months.find(m => m.value === selectedMonth) || months[0];
  const days = Array.from({ length: currentMonthData.days }, (_, i) => i + 1);
  const hebrewDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  
  // Current real date logic for locking future days
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  useEffect(() => {
    let interval: number;

    if (lockedDateSelected) {
      const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeToNextQuiz('00:00:00');
          return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeToNextQuiz(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      };

      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    }

    return () => clearInterval(interval);
  }, [lockedDateSelected]);

  const getDifficulty = (dayNum: number): Difficulty => {
    const date = new Date(2026, selectedMonth, dayNum);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return Difficulty.EASY;
    if (dayOfWeek === 3 || dayOfWeek === 4) return Difficulty.HARD;
    if (dayOfWeek === 5 || dayOfWeek === 6) return Difficulty.VERY_HARD;
    return Difficulty.MEDIUM;
  };

  const handleDayClick = (dateStr: string, isLocked: boolean, isFuture: boolean) => {
    if (isFuture) return;
    
    if (isLocked) {
      setLockedDateSelected(true);
    } else {
      onSelectDate(dateStr);
    }
  };

  const nextMonth = () => {
    if (selectedMonth < 3) setSelectedMonth(selectedMonth + 1);
  };

  const prevMonth = () => {
    if (selectedMonth > 1) setSelectedMonth(selectedMonth - 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative" dir="rtl">
      {/* Locked Date Timer Modal */}
      {lockedDateSelected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/50" onClick={() => setLockedDateSelected(false)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center" onClick={e => e.stopPropagation()}>
             <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse">
               <i className="fa-solid fa-clock"></i>
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2">היום הזה נעול</h3>
             <p className="text-slate-500 font-medium mb-6 leading-relaxed">
               ניצלת את כל הניסיונות להיום.<br/>
               אפשר לנסות לפתור שוב בעוד:
             </p>
             <div className="text-4xl font-black text-blue-600 mb-8 font-mono tracking-wider">
               {timeToNextQuiz}
             </div>
             <button 
               onClick={() => setLockedDateSelected(false)}
               className="w-full py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black transition-colors"
             >
               הבנתי, נתראה מחר!
             </button>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-between p-4 md:p-6 bg-white border-b border-slate-200 flex-shrink-0 z-20">
        <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">חידון יומי</h2>
          <div className="flex items-center justify-center gap-4 mt-1">
             <button 
              onClick={prevMonth} 
              disabled={selectedMonth === 1}
              className={`text-slate-400 hover:text-blue-500 disabled:opacity-20 transition-colors`}
             >
               <i className="fa-solid fa-chevron-right text-xl"></i>
             </button>
             <p className="text-[16px] text-blue-600 font-black uppercase tracking-widest min-w-[100px]">{currentMonthData.name} 2026</p>
             <button 
              onClick={nextMonth} 
              disabled={selectedMonth === 3}
              className={`text-slate-400 hover:text-blue-500 disabled:opacity-20 transition-colors`}
             >
               <i className="fa-solid fa-chevron-left text-xl"></i>
             </button>
          </div>
        </div>
        <div className="w-10 md:w-12"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Difficulty Schedule Legend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
             <div className="text-center text-s font-black text-slate-400 uppercase tracking-widest mb-3">לוח קושי שבועי</div>
             <div className="flex justify-between items-center gap-2">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-[11px] font-bold text-slate-600">יום א'</span>
                  <span className="text-[11px] text-slate-400">קל</span>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-[11px] font-bold text-slate-600">ב' - ד'</span>
                  <span className="text-[11px] text-slate-400">בינוני</span>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  <span className="text-[11px] font-bold text-slate-600">ה' - ו'</span>
                  <span className="text-[11px] text-slate-400">קשה</span>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-[11px] font-bold text-slate-600">שבת</span>
                  <span className="text-[11px] text-slate-400">אלוף</span>
                </div>
             </div>
          </div>

          {/* Status Legend */}
          <div className="flex justify-center gap-4 text-[12px] font-black text-slate-500">
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div> הצלחת</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div> נכשלת</div>
             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div> נסיונות</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {hebrewDays.map(d => (
              <div key={d} className="text-center font-black text-slate-400 text-xs py-2">{d}'</div>
            ))}
            
            {Array.from({ length: new Date(2026, selectedMonth, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}

            {days.map(d => {
              const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
              const dateStr = `2026-${monthStr}-${d.toString().padStart(2, '0')}`;
              const stats = dailyProgress[dateStr] || { status: 'none', attempts: 0 };
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const diff = getDifficulty(d);
              
              const isLocked = !isFuture && 
                               stats.attempts >= 3 && 
                               stats.status !== 'won' && 
                               (stats.lastAttemptDate === todayStr || (!stats.lastAttemptDate && dateStr === todayStr));
                               
              // If the attempts were from a previous day and they didn't win, we treat them as 0 for display
              // because they get a fresh start today.
              const attemptsUsed = (stats.status === 'won' || stats.lastAttemptDate === todayStr || (!stats.lastAttemptDate && dateStr === todayStr)) 
                                   ? stats.attempts 
                                   : 0;

              // Logic for styling
              let bgClass = 'bg-white hover:border-blue-200 shadow-sm';
              let borderClass = isToday ? 'border-blue-600 shadow-lg shadow-blue-100 ring-2 ring-blue-50' : 'border-slate-100';
              let textClass = isToday ? 'text-blue-600' : 'text-slate-800';

              if (stats.status === 'won') {
                bgClass = 'bg-green-50';
                borderClass = 'border-green-200';
                textClass = 'text-green-600';
              } else if (isLocked) {
                bgClass = 'bg-slate-100';
                borderClass = 'border-slate-200';
                textClass = 'text-slate-400';
              } else if (isFuture) {
                bgClass = 'bg-slate-50 opacity-40 cursor-not-allowed';
                borderClass = 'border-slate-50';
              }

              // Color stripe based on difficulty
              let difficultyColor = 'bg-blue-400';
              if (diff === Difficulty.EASY) difficultyColor = 'bg-green-400';
              if (diff === Difficulty.HARD) difficultyColor = 'bg-orange-400';
              if (diff === Difficulty.VERY_HARD) difficultyColor = 'bg-rose-400';
              
              if (isLocked || isFuture) difficultyColor = 'bg-slate-300';

              return (
                <button
                  key={d}
                  disabled={isFuture} 
                  onClick={() => handleDayClick(dateStr, isLocked, isFuture)}
                  className={`
                    aspect-square rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-center relative transition-all active:scale-95 overflow-hidden
                    ${borderClass} ${bgClass}
                  `}
                >
                  {/* Small colored dot indicating difficulty level */}
                  <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${difficultyColor}`}></div>

                  <span className={`text-base md:text-xl font-black ${textClass} mb-1`}>
                    {d}
                  </span>

                  {/* Indicators centered */}
                  <div className="flex gap-1 h-2 items-center justify-center">
                    {!isFuture && (
                      Array.from({length: 3}).map((_, i) => (
                        <div 
                          key={i} 
                          className={`
                            rounded-full transition-colors
                            ${stats.status === 'won' ? 'hidden' : ''} 
                            ${isLocked ? 'w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500' : 
                              (i < attemptsUsed ? 'w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-400' : 'w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-200')}
                          `}
                        ></div>
                      ))
                    )}
                    
                    {stats.status === 'won' && (
                       <i className="fa-solid fa-check text-green-500 text-sm md:text-base"></i>
                    )}
                    
                    {isLocked && stats.status !== 'won' && (
                       <i className="fa-solid fa-lock text-slate-400 text-xs md:text-sm absolute top-2 left-2 opacity-50"></i>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
             <i className="fa-solid fa-circle-info text-blue-500 text-xl mb-3 block"></i>
             <p className="text-blue-800 text-sm font-bold leading-relaxed">
               לכל יום יש מונה נפרד של <strong>3 ניסיונות</strong>.<br/>
               <span className="opacity-70 text-xs">נכשלת היום? מחר יפתח חידון חדש עם 3 ניסיונות מלאים!</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuizCalendar;
