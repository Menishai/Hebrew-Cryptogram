import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1300; // 1.3 seconds
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 200); // Small delay to show 100% before transitioning
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-[100dvh] bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden" 
      dir="rtl"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/30 blur-[100px] rounded-full"></div>

      <div className="flex flex-col items-center justify-center z-10 w-full px-8">
        <motion.div 
          layoutId="app-logo"
          className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-12 animate-float"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl shadow-blue-200 rotate-6 transform"></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[3rem] md:rounded-[3.5rem] -rotate-3 overflow-hidden">
             <div className="shimmer absolute inset-0 opacity-30"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-white text-6xl md:text-7xl font-black drop-shadow-md">א</span>
            <div className="bg-white/90 text-blue-600 px-3 py-0.5 rounded-md text-xs md:text-sm font-black mt-2 shadow-sm">
              01
            </div>
          </div>

          {/* Floating tiny symbols */}
          <div className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-sm md:text-base shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
            <i className="fa-solid fa-key"></i>
          </div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 md:w-14 md:h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl shadow-lg rotate-12">
            <i className="fa-solid fa-hashtag text-xs md:text-sm"></i>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-[900] tracking-tight mb-2 text-gradient"
        >
          אלוף הצופן
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] md:text-[12px] mb-12"
        >
          Cryptogram Master Elite
        </motion.p>

        {/* Loading Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs"
        >
          <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-3 text-center text-slate-400 text-xs font-bold tracking-widest">
            טוען... {Math.round(progress)}%
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
