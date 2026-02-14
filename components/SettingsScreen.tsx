
import React, { useState } from 'react';
import { Difficulty, FontSize, Statistics, QuoteCategory } from '../types';
import { encodeSaveData, decodeSaveData } from '../utils/saveUtils';

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
  stats: Statistics;
  onImportData: (data: any) => void;
  onReportMistake?: () => void;
  activeCategories: QuoteCategory[];
  onCategoriesChange: (cats: QuoteCategory[]) => void;
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
  onBack,
  stats,
  onImportData,
  onReportMistake,
  activeCategories,
  onCategoriesChange
}) => {
  const [importMode, setImportMode] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [exportedCode, setExportedCode] = useState('');
  const [importValue, setImportValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const difficultyOptions = [
    { id: 'AUTO', label: 'אוטומטי', desc: 'קושי משתנה לפי השלב', icon: 'fa-wand-magic-sparkles', color: 'text-indigo-600' },
    { id: Difficulty.EASY, label: 'קל', desc: 'יותר אותיות גלויות', icon: 'fa-seedling', color: 'text-green-600' },
    { id: Difficulty.MEDIUM, label: 'בינוני', desc: 'איזון מושלם לאתגר', icon: 'fa-user-astronaut', color: 'text-blue-600' },
    { id: Difficulty.HARD, label: 'קשה', desc: 'פחות אותיות גלויות', icon: 'fa-fire', color: 'text-orange-600' },
    { id: Difficulty.VERY_HARD, label: 'קשה מאוד', desc: 'מינימום עזרה ופסילות', icon: 'fa-bolt', color: 'text-rose-600' },
  ];

  const fontSizeOptions = [
    { id: FontSize.SMALL, label: 'קטן', previewSize: 'text-lg' },
    { id: FontSize.MEDIUM, label: 'בינוני', previewSize: 'text-2xl' },
    { id: FontSize.LARGE, label: 'גדול', previewSize: 'text-4xl' },
  ];

  const packOptions = [
    { id: 'proverb', label: 'פתגמים וציטוטים כלליים', purchased: true },
    { id: 'song', label: 'שירים ישראליים', purchased: true },
    { id: 'source', label: 'מקורות ויהדות', purchased: true },
    { id: 'famous', label: 'אישים מפורסמים', purchased: true },
    { id: 'sports', label: 'ספורט וקלישאות', purchased: stats.isSportsPackPurchased },
    { id: 'cinema', label: 'קולנוע וטלוויזיה', purchased: stats.isCinemaPackPurchased },
  ];

  const toggleCategory = (catId: QuoteCategory) => {
    let newCats: QuoteCategory[];
    if (activeCategories.includes(catId)) {
      if (activeCategories.length <= 1) return; // Must have at least one
      newCats = activeCategories.filter(c => c !== catId);
    } else {
      newCats = [...activeCategories, catId];
    }
    onCategoriesChange(newCats);
  };

  const handleExport = () => {
    const saveData = {
      stats,
      difficulty,
      fontSize,
      vibrationEnabled,
      soundEnabled,
      timestamp: Date.now()
    };
    const code = encodeSaveData(saveData);
    setExportedCode(code);
    setExportMode(true);
    setImportMode(false);
    
    navigator.clipboard.writeText(code).then(() => {
      setStatusMessage({ text: 'קוד השמירה הועתק ללוח!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
    });
  };

  const handleImport = () => {
    if (!importValue.trim()) return;
    const data = decodeSaveData(importValue.trim());
    if (data && data.stats) {
      onImportData(data);
      setStatusMessage({ text: 'הנתונים שוחזרו בהצלחה!', type: 'success' });
      setImportMode(false);
      setImportValue('');
    } else {
      setStatusMessage({ text: 'קוד לא תקין, נסה שוב', type: 'error' });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="flex flex-col items-center h-full p-4 md:p-6 bg-slate-50 overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm transition-transform active:scale-95">
          <i className="fa-solid fa-arrow-right"></i>
        </button>
        <h2 className="text-xl font-black text-slate-800">הגדרות</h2>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-md space-y-6 pb-12">
        {/* Status Toast */}
        {statusMessage && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[150] font-black text-white animate-in slide-in-from-bottom duration-300 ${statusMessage.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* Difficulty Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">רמת קושי</h3>
          <div className="space-y-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onDifficultyChange(opt.id as any)}
                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all border-2 text-right ${
                  difficulty === opt.id 
                    ? 'bg-white border-blue-600 shadow-md scale-[1.01]' 
                    : 'bg-white border-slate-200 shadow-sm grayscale opacity-70'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg bg-slate-50 ${opt.color}`}>
                  <i className={`fa-solid ${opt.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-base font-black text-slate-800 leading-tight">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{opt.desc}</div>
                </div>
                {difficulty === opt.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">גודל טקסט</h3>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFontSizeChange(opt.id)}
                className={`p-3 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                  fontSize === opt.id 
                    ? 'bg-white border-blue-600 shadow-md text-blue-600' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className={`font-black mb-1 ${opt.previewSize}`}>א</div>
                <div className="font-bold text-xs">{opt.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Category Pack Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">חבילות תוכן</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {packOptions.map((pack) => (
              <div key={pack.id} className={`flex items-center justify-between p-4 ${!pack.purchased ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-3 text-right">
                  <span className={`text-sm font-bold ${activeCategories.includes(pack.id as QuoteCategory) ? 'text-blue-700' : 'text-slate-600'}`}>
                    {pack.label}
                  </span>
                  {!pack.purchased && <i className="fa-solid fa-lock text-[10px] text-slate-400"></i>}
                </div>
                <button 
                  disabled={!pack.purchased}
                  onClick={() => toggleCategory(pack.id as QuoteCategory)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${activeCategories.includes(pack.id as QuoteCategory) ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${activeCategories.includes(pack.id as QuoteCategory) ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
          {!stats.isSportsPackPurchased && !stats.isCinemaPackPurchased && (
            <p className="text-[10px] text-slate-400 font-bold mt-2 px-2 text-center">חבילות תוכן חדשות זמינות בחנות!</p>
          )}
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">העדפות</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-right">
                <i className={`fa-solid fa-mobile-vibration text-lg ${vibrationEnabled ? 'text-orange-500' : 'text-slate-300'}`}></i>
                <span className="font-bold text-slate-800 text-sm">רטט בטעויות</span>
              </div>
              <button onClick={onVibrationToggle} className={`w-11 h-6 rounded-full relative transition-colors ${vibrationEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${vibrationEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-right">
                <i className={`fa-solid ${soundEnabled ? 'fa-volume-high text-purple-500' : 'fa-volume-xmark text-slate-300'} text-lg`}></i>
                <span className="font-bold text-slate-800 text-sm">צלילים</span>
              </div>
              <button onClick={onSoundToggle} className={`w-11 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${soundEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Save Transfer Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">סנכרון ומעבר מכשיר</h3>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-black border transition-all ${exportMode ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
              >
                <i className="fa-solid fa-copy"></i>
                <span className="text-xs">ייצוא שמירה</span>
              </button>
              <button
                onClick={() => { setImportMode(!importMode); setExportMode(false); }}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-black border transition-all ${importMode ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <i className="fa-solid fa-paste"></i>
                <span className="text-xs">ייבוא שמירה</span>
              </button>
            </div>

            {exportMode && exportedCode && (
              <div className="animate-in fade-in slide-in-from-top duration-300 space-y-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">קוד השמירה שלך (הועתק ללוח):</p>
                  <div className="w-full max-h-24 overflow-y-auto bg-white p-3 rounded-lg border border-slate-100 text-[10px] font-mono break-all text-slate-900 select-all">
                    {exportedCode}
                  </div>
                </div>
              </div>
            )}

            {importMode && (
              <div className="animate-in fade-in slide-in-from-top duration-300 space-y-3 pt-2">
                <textarea
                  value={importValue}
                  onChange={(e) => setImportValue(e.target.value)}
                  placeholder="הדבק כאן את קוד השמירה..."
                  className="w-full h-24 p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-900 placeholder:text-slate-300"
                />
                <div className="flex gap-2">
                  <button onClick={handleImport} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100">שחזר</button>
                  <button onClick={() => setImportValue('')} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-black">נקה</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Support Section */}
        <section>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest px-2 mb-3 text-right">תמיכה ומשוב</h3>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <button 
              onClick={onReportMistake}
              className="w-full py-4 rounded-2xl flex items-center justify-between px-4 bg-rose-50 border-2 border-rose-100 text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-flag"></i>
                <span className="font-black text-sm">מצאת טעות? דווח לנו</span>
              </div>
              <i className="fa-solid fa-chevron-left text-xs opacity-50"></i>
            </button>
          </div>
        </section>

        <div className="text-center pt-4">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Designed for Cryptogram Master Elite</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
