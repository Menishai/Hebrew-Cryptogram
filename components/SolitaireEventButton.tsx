import React, { useState, useEffect } from 'react';

interface SolitaireEventButtonProps {
  onClick: () => void;
}

// Helper: Check if current time is within the Event Window (Thu 18:00 - Sun 09:00)
export const isEventTime = (now: Date) => {
  const day = now.getDay();
  const hour = now.getHours();
  
  if (day === 4 && hour >= 18) return true; // Thursday >= 18:00
  if (day === 5 || day === 6) return true;  // Friday, Saturday
  if (day === 0 && hour < 9) return true;   // Sunday < 09:00
  
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
    if (isLocked) {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      return;
    }

    if (isTrial) {
      localStorage.setItem('hasPlayedSolitaireTrial', 'true');
      setHasPlayedTrial(true);
    }

    onClick();
  };

  const nextEventDate = getNextEventDate(now);
  const countdownStr = formatCountdown(nextEventDate, now);

  return (
    <div className="relative flex flex-col items-center gap-1" dir="rtl">
      <button
        onClick={handleClick}
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shadow-sm border transition-all active:scale-95 relative overflow-hidden ${
          isLocked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white hover:shadow-md hover:scale-105'
        }`}
        title="סוליטר צופן"
      >
        <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-layer-group'} text-lg md:text-xl relative z-10`}></i>
        
        {!isLocked && (
          <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
        )}
        
        {isTrial && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
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
