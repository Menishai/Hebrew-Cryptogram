
import React from 'react';
import { motion } from 'motion/react';
import SolitaireEventButton from './SolitaireEventButton';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  hasSavedGame: boolean;
  onStats: () => void;
  onSettings: () => void;
  onAchievements: () => void;
  onDailyQuiz: () => void;
  onSolitaireEvent: () => void;
  onShowTutorial: () => void;
  onOpenShop: () => void;
  currentLevel: number;
  hasUnclaimedAchievements?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onNewGame, 
  onContinue, 
  hasSavedGame, 
  onStats, 
  onSettings, 
  onAchievements,
  onDailyQuiz,
  onSolitaireEvent,
  onShowTutorial, 
  onOpenShop,
  currentLevel,
  hasUnclaimedAchievements = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/30 blur-[100px] rounded-full"></div>

      {/* Floating Action Buttons Area (Top Right) */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
        <button 
          onClick={onShowTutorial}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition-all active:scale-95"
          title="איך משחקים?"
        >
          <i className="fa-solid fa-question text-lg md:text-xl"></i>
        </button>
        <button 
          onClick={onOpenShop}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm border border-amber-100 hover:bg-amber-50 transition-all active:scale-95"
          title="חנות"
        >
          <i className="fa-solid fa-cart-shopping text-lg md:text-xl"></i>
        </button>
      </div>

      {/* Floating Action Buttons Area (Top Left) */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-3 items-center">
        <button 
          onClick={onDailyQuiz}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm border border-rose-100 hover:bg-rose-50 transition-all active:scale-95 group relative"
          title="חידון יומי"
        >
          <i className="fa-solid fa-calendar-day text-lg md:text-xl"></i>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </button>
        
        <SolitaireEventButton onClick={onSolitaireEvent} />
      </div>

      {/* New Modern Logo Section */}
      <div className="mt-8 md:mt-12 mb-10 md:mb-14 relative z-10">
        <motion.div 
          layoutId="app-logo"
          className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 animate-float"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-200 rotate-6 transform transition-transform group-hover:rotate-0"></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[2rem] md:rounded-[2.5rem] -rotate-3 overflow-hidden">
             <div className="shimmer absolute inset-0 opacity-30"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-white text-4xl md:text-5xl font-black drop-shadow-md">א</span>
            <div className="bg-white/90 text-blue-600 px-2 rounded-md text-[10px] md:text-[11px] font-black mt-1 shadow-sm">
              01
            </div>
          </div>

          {/* Floating tiny symbols */}
          <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-amber-400 rounded-xl flex items-center justify-center text-white text-[10px] md:text-xs shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
            <i className="fa-solid fa-key"></i>
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-base md:text-lg shadow-lg rotate-12">
            <i className="fa-solid fa-hashtag text-[9px] md:text-[11px]"></i>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl md:text-6xl font-[900] tracking-tight mb-2 text-gradient"
        >
          אלוף הצופן
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] md:text-[12px]"
        >
          Cryptogram Master Elite
        </motion.p>
        <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1 w-6 md:w-8 bg-blue-200 rounded-full"></div>
            <div className="h-1 w-2 bg-blue-400 rounded-full"></div>
            <div className="h-1 w-6 md:w-8 bg-blue-200 rounded-full"></div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3 md:space-y-4 relative z-10">
        <button
          onClick={onNewGame}
          className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-200 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 ${
            hasSavedGame ? 'py-3 md:py-4 text-base md:text-lg opacity-90' : 'py-4 md:py-5 text-lg md:text-xl'
          }`}
        >
          <i className="fa-solid fa-arrow-left"></i>
          שחק בשלב {currentLevel}
        </button>

        <button
          onClick={onContinue}
          disabled={!hasSavedGame}
          className={`w-full py-4 md:py-5 rounded-[2rem] font-black text-lg md:text-xl transition-all flex items-center justify-center gap-3 border-[3px] ${
            hasSavedGame 
              ? 'bg-white text-blue-600 hover:bg-blue-50 border-blue-400 shadow-xl shadow-blue-400/20 active:scale-95 animate-pulse scale-[1.02]' 
              : 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed opacity-50'
          }`}
        >
          <i className="fa-solid fa-arrow-left"></i>
          המשך פאזל
        </button>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={onStats}
            className="py-4 md:py-5 bg-white text-slate-700 rounded-[1.5rem] font-black border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex flex-col items-center gap-2"
          >
            <i className="fa-solid fa-chart-simple text-blue-600 text-base md:text-lg"></i>
            <span className="text-[12px] md:text-[13px]">נתונים</span>
          </button>
          
          <button
            onClick={onAchievements}
            className="py-4 md:py-5 bg-white text-slate-700 rounded-[1.5rem] font-black border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex flex-col items-center gap-2 relative"
          >
            {hasUnclaimedAchievements && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            )}
            <i className="fa-solid fa-trophy text-amber-600 text-base md:text-lg"></i>
            <span className="text-[12px] md:text-[13px]">הישגים</span>
          </button>

          <button
            onClick={onSettings}
            className="py-4 md:py-5 bg-white text-slate-700 rounded-[1.5rem] font-black border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex flex-col items-center gap-2"
          >
            <i className="fa-solid fa-gear text-slate-500 text-base md:text-lg"></i>
            <span className="text-[12px] md:text-[13px]">הגדרות</span>
          </button>
        </div>
      </div>

      <div className="mt-12 md:mt-16 flex flex-col items-center gap-2 opacity-50">
        <p className="text-slate-500 text-[11px] md:text-[12px] font-black uppercase tracking-widest">Version 1.65</p>
      </div>
    </div>
  );
};

export default MainMenu;
