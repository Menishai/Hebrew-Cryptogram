import React, { useState, useEffect } from 'react';

interface SolitaireEventButtonProps {
  onClick: () => void;
}

// Helper: Check if current time is within the Event Window (Thu 18:00 - Sun 09:00)
export const isEventTime = (now: Date) => {
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
  const hour = now.getHours();
  
  if (day === 4 && hour >= 18) return true; // Thursday >= 18:00 // צריך להיות 4, 18
  if (day === 5 || day === 6) return true;  // Friday, Saturday // צריך להיות 5, 6
  if (day === 0 && hour < 9) return true;   // Sunday < 09:00 // צריך להיות 0
  
  return false;
};

// Helper: Get the Date object for the upcoming Thursday at 18:00
export const getNextEventDate = (now: Date) => {
  const target = new Date(now);
  const day = target.getDay();
  
  // Calculate days until next Thursday (4)
  let daysToAdd = (4 - day + 7) % 7;
  
  // If it's Thursday but past 18:00, the next event starts NEXT Thursday
  if (day === 4 && target.getHours() >= 18) {
    daysToAdd = 7;
  }

  target.setDate(target.getDate() + daysToAdd);
  target.setHours(18, 0, 0, 0);
  return target;
};

// Helper: Format milliseconds into DD:HH:MM
export const formatCountdown = (target: Date, now: Date) => {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d)}:${pad(h)}:${pad(m)}`;
};

const SolitaireEventButton: React.FC<SolitaireEventButtonProps> = ({ onClick }) => {
  const [now, setNow] = useState(new Date());
  const [hasPlayedTrial, setHasPlayedTrial] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // Read trial state from localStorage
    const stored = localStorage.getItem('hasPlayedSolitaireTrial');
    if (stored === 'true') {
      setHasPlayedTrial(true);
    }

    // Update time every second for the live countdown
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const eventActive = isEventTime(now);
  const isLocked = !eventActive && hasPlayedTrial;
  const isTrial = !eventActive && !hasPlayedTrial;

  const handleClick = () => {
    // 1. אם נעול - מקפיצים הודעה ולא עושים כלום
    if (isLocked) {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000); // מעלים את ההודעה אחרי 3 שניות
      return;
    }

    // 2. אם זו טעימה חינם - שומרים בזיכרון שניצלנו אותה
    if (isTrial) {
      localStorage.setItem('hasPlayedSolitaireTrial', 'true');
      setHasPlayedTrial(true);
    }

    // 3. מפעילים את הפונקציה שמעבירה מסך!
    onClick();
  };

  const nextEventDate = getNextEventDate(now);
  const countdownStr = formatCountdown(nextEventDate, now);

  return (
    <div className="relative w-full" dir="rtl">
      <button
        onClick={handleClick}
        className={`w-full p-4 flex items-center justify-between rounded-[2rem] shadow-xl border-2 transition-all active:scale-95 relative overflow-hidden group ${
          isLocked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 border-indigo-500/30 text-white hover:shadow-indigo-500/20 hover:scale-[1.02]'
        }`}
      >
        {/* Animated background glow for active state */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}

        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
            isLocked ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          }`}>
            <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-crown'} text-xl drop-shadow-sm`}></i>
        </div>

          <div className="flex flex-col items-start text-right">
            <span className="font-black text-lg tracking-wide">טורניר סוליטר</span>
            <span className={`text-xs font-bold ${isLocked ? 'text-slate-400' : 'text-indigo-300'}`}>
              {isLocked ? 'הטורניר סגור כרגע' : 'אירוע מיוחד!'}
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end">
      {isLocked ? (
        <div className="relative z-10 flex flex-col items-end">
          {countdownStr}
        </div>
      ) : isTrial ? (
            <div className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shadow-sm border border-amber-200 animate-pulse">
          חינם
            </div>
          ) : (
            <i className="fa-solid fa-chevron-left text-indigo-300 group-hover:text-white transition-colors"></i>
          )}
        </div>
      </button>

      {/* Toast Message */}
      {toastVisible && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 z-50">
          הטורניר סגור כרגע. נתראה ביום חמישי!
        </div>
      )}
    </div>
  );
};

export default SolitaireEventButton;