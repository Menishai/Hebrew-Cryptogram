import React, { useState, useEffect } from 'react';

interface SolitaireEventButtonProps {
  onClick: () => void;
}

// Helper: Check if current time is within the Event Window (Thu 18:00 - Sun 09:00)
export const isEventTime = (now: Date) => {
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
  const hour = now.getHours();
  
  if (day === 0 && hour >= 18) return true; // Thursday >= 18:00 // צריך להיות 4, 18
  if (day === 1 || day === 6) return true;  // Friday, Saturday // צריך להיות 5, 6
  if (day === 6 && hour < 9) return true;   // Sunday < 09:00 // צריך להיות 0
  
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
    <div className="relative flex flex-col items-center gap-1" dir="rtl">
      <button
        onClick={handleClick}
        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-[1.25rem] shadow-lg border-2 transition-all active:scale-90 relative overflow-hidden group ${
          isLocked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 border-white/30 text-white hover:shadow-indigo-200/50 hover:scale-110'
        }`}
        title="סוליטר צופן"
      >
        {/* Animated background glow for active state */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-layer-group'} text-xl md:text-2xl drop-shadow-sm`}></i>
        </div>

        {!isLocked && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
             <i className="fa-solid fa-star text-[8px] text-white"></i>
          </div>
        )}
        
        {isTrial && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
          </span>
        )}
      </button>

      {isLocked ? (
        <div className="text-[9px] md:text-[10px] font-black text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm border border-slate-100" dir="ltr">
          {countdownStr}
        </div>
      ) : isTrial ? (
        <div className="text-[9px] md:text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shadow-sm border border-amber-100">
          חינם
        </div>
      ) : null}

      {/* Toast Message */}
      {toastVisible && (
        <div className="absolute top-14 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-top-2 z-50">
          הטורניר סגור כרגע. נתראה ביום חמישי!
        </div>
      )}
    </div>
  );
};

export default SolitaireEventButton;