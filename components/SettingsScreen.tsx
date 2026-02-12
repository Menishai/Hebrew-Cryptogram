
import React from 'react';
import { Difficulty, FontSize } from '../types';

interface SettingsScreenProps {
  difficulty: Difficulty | 'AUTO';
  onDifficultyChange: (newDiff: Difficulty | 'AUTO') => void;
  fontSize: FontSize;
  onFontSizeChange: (newSize: FontSize) => void;
  vibrationEnabled: boolean;
  onVibrationToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  difficulty, 
  onDifficultyChange, 
  fontSize,
  onFontSizeChange,
  vibrationEnabled, 
  onVibrationToggle,
  soundEnabled,
  onSoundToggle,
  onBack 
}) => {
  const difficultyOptions = [
    { id: 'AUTO', label: 'אוטומטי', desc: 'רמת קושי משתנה לפי השלב', icon: 'fa-wand-magic-sparkles', color: 'text-indigo-600' },
    { id: Difficulty.EASY, label: 'קל', desc: 'יותר אותיות גלויות, יותר נסיונות', icon: 'fa-seedling', color: 'text-green-600' },
    { id: Difficulty.MEDIUM, label: 'בינוני', desc: 'איזון מושלם לאתגר מהנה', icon: 'fa-user-astronaut', color: 'text-blue-600' },
    { id: Difficulty.HARD, label: 'קשה', desc: 'פחות אותיות גלויות, מעט טעויות', icon: 'fa-fire', color: 'text-orange-600' },
    { id: Difficulty.VERY_HARD, label: 'קשה מאוד', desc: 'ללא אותיות גלויות, רק 2 טעויות', icon: 'fa-bolt', color: 'text-rose-600' },
  ];

  const fontSizeOptions = [
    { id: FontSize.SMALL, label: 'קטן', previewSize: 'text-lg md:text-xl' },
    { id: FontSize.MEDIUM, label: 'בינוני', previewSize: 'text-2xl md:text-3xl' },
    { id: FontSize.LARGE, label: 'גדול', previewSize: 'text-4xl md:text-5xl' },
  ];

  const handleVibrationClick = () => {
    onVibrationToggle();
    if (!vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="flex flex-col items-center h-full p-4 md:p-6 bg-slate-50 overflow-y-auto" dir="rtl">
      <div className="w-full flex items-center justify-between mb-6 md:mb-8 flex-shrink-0">
        <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <h2 className="text-xl md:text-2xl font-black text-slate-800">הגדרות</h2>
        <div className="w-10 md:w-12"></div>
      </div>

      <div className="w-full max-w-md space-y-6 md:space-y-8 pb-12">
        {/* Difficulty Section */}
        <section>
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest px-2 mb-3 text-right">רמת קושי</h3>
          <div className="space-y-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onDifficultyChange(opt.id as any)}
                className={`w-full p-4 md:p-5 rounded-3xl flex items-center gap-4 md:gap-5 transition-all border-2 text-right ${
                  difficulty === opt.id 
                    ? 'bg-white border-blue-600 shadow-md scale-[1.02]' 
                    : 'bg-white border-slate-200 shadow-sm grayscale opacity-70'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg md:text-xl bg-slate-50 ${opt.color}`}>
                  <i className={`fa-solid ${opt.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-base md:text-lg font-black text-slate-800 leading-tight">{opt.label}</div>
                  <div className="text-sm text-slate-500 font-medium">{opt.desc}</div>
                </div>
                {difficulty === opt.id && (
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] shadow-sm">
                    <i className="fa-solid fa-check"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size Section */}
        <section>
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest px-2 mb-3 text-right">גודל טקסט</h3>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFontSizeChange(opt.id)}
                className={`p-3 md:p-4 h-24 md:h-28 rounded-3xl flex flex-col items-center justify-between transition-all border-2 ${
                  fontSize === opt.id 
                    ? 'bg-white border-blue-600 shadow-md' 
                    : 'bg-white border-slate-200 shadow-sm opacity-70'
                }`}
              >
                <div className={`font-black text-blue-600 h-10 md:h-12 flex items-center ${opt.previewSize}`}>
                  א
                </div>
                <div className="font-bold text-slate-800 text-sm md:text-base">{opt.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest px-2 mb-3 text-right">העדפות</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4 md:p-5">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base md:text-lg border ${vibrationEnabled ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                  <i className="fa-solid fa-mobile-vibration"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 text-sm md:text-base">רטט</div>
                  <div className="text-[12px] md:text-[13px] text-slate-500">רטט בטעויות</div>
                </div>
              </div>
              <button 
                onClick={handleVibrationClick}
                className={`w-10 h-6 md:w-12 md:h-7 rounded-full transition-colors relative ${vibrationEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow-sm transition-all ${vibrationEnabled ? 'left-5 md:left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 md:p-5">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base md:text-lg border ${soundEnabled ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                  <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 text-sm md:text-base">סאונד</div>
                  <div className="text-[12px] md:text-[13px] text-slate-500">צלילים במהלך המשחק</div>
                </div>
              </div>
              <button 
                onClick={onSoundToggle}
                className={`w-10 h-6 md:w-12 md:h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow-sm transition-all ${soundEnabled ? 'left-5 md:left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <p className="text-slate-600 text-sm md:text-base font-medium italic leading-relaxed">
              הגדרות אלו יישמרו במכשיר שלך. שינוי רמת קושי במהלך משחק יחליף את הפאזל הנוכחי.
            </p>
          </div>
          
          <a 
            href="mailto:cryptoheb@gmail.com?subject=דיווח על טעות כתיב באלוף הצופן" 
            className="flex items-center justify-center gap-2 py-3.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-bold border-2 border-dashed border-slate-300 rounded-2xl active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-pen-nib"></i>
            מצאת טעות כתיב? דווח לנו
          </a>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Designed for Cryptogram Master Elite</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
