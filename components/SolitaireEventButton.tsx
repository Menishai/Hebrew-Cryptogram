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
  if (day === 0 && hour < 9) return true;   // Sunday < 09:00 // צריך להיות 0, 9
  
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
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shadow-sm border transition-all active:scale-95 relative group ${
          isLocked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white hover:shadow-lg hover:scale-105'
        }`}
        title="טורניר סוליטר"
      >
        <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-crown'} text-lg md:text-xl drop-shadow-sm`}></i>
        
        {isLocked && (
          <span className="absolute -top-2 -right-2 bg-slate-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm">
            בקרוב
          </span>
        )}

        {!isLocked && isTrial && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm animate-bounce">
            חינם
          </span>
        )}
      </button>

      {isLocked && (
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <div className="flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">הטירוף מתחיל בעוד:</span>
          </div>
          <div className="text-[9px] md:text-[10px] font-black text-slate-600 bg-amber-50 px-2 py-0.5 rounded-full shadow-sm border border-amber-200 whitespace-nowrap flex items-center gap-1" dir="ltr">
            <i className="fa-regular fa-clock text-[8px]"></i>
              {countdownStr}
          </div>
        </div>
        )}

      {/* Toast Message */}
      {toastVisible && (
        <div className="absolute top-14 left-0 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-top-2 z-50">
          הטורניר סגור כרגע. נתראה ביום חמישי!
        </div>
      )}
    </div>
  );
};

export default SolitaireEventButton;