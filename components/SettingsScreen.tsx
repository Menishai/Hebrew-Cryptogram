
import React, { useState, useRef } from 'react';
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
  notificationsEnabled: boolean;
  onNotificationsToggle: () => void;
  notificationTime: string;
  onNotificationTimeChange: (time: string) => void;
  onBack: () => void;
  stats: Statistics;
  onImportData: (data: any) => void;
  onReportMistake?: () => void;
  activeCategories: QuoteCategory[];
  onCategoriesChange: (cats: QuoteCategory[]) => void;
  onOpenShop: () => void;
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
  notificationsEnabled,
  onNotificationsToggle,
  notificationTime,
  onNotificationTimeChange,
  onBack,
  stats,
  onImportData,
  onReportMistake,
  activeCategories,
  onCategoriesChange,
  onOpenShop
}) => {
  const [importMode, setImportMode] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [exportedCode, setExportedCode] = useState('');
  const [importValue, setImportValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isPacksExpanded, setIsPacksExpanded] = useState(false);
  const [lockedPackClicked, setLockedPackClicked] = useState<string | null>(null);

  // Swipe back logic
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 100;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchEndRef.current - touchStartRef.current;
    const isRightSwipe = distance > SWIPE_THRESHOLD;
    if (isRightSwipe) {
      onBack();
    }
  };

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
    <div 
      className="flex flex-col items-center h-full p-4 md:p-6 bg-slate-50 overflow-y-auto" 
      dir="rtl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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
          <div className="grid grid-cols-2 gap-2">
            {difficultyOptions.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => onDifficultyChange(opt.id as any)}
                className={`p-2 rounded-2xl flex items-center gap-2 transition-all border-2 text-right ${
                  idx === 0 ? 'col-span-2' : ''
                } ${
                  difficulty === opt.id 
                    ? 'bg-white border-blue-600 shadow-md scale-[1.02]' 
                    : 'bg-white border-slate-200 shadow-sm grayscale opacity-70'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-50 flex-shrink-0 ${opt.color}`}>
                  <i className={`fa-solid ${opt.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-800 leading-none">{opt.label}</div>
                  <div className="text-[9px] text-slate-500 font-medium mt-1 leading-tight">{opt.desc}</div>
                </div>
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
          <button 
            onClick={() => setIsPacksExpanded(!isPacksExpanded)}
            className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all border-2 ${isPacksExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-slate-800">ניהול חבילות תוכן</h3>
                <p className="text-[10px] text-slate-500 font-medium">{activeCategories.length} חבילות פעילות</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-transform ${isPacksExpanded ? 'rotate-180' : ''}`}>
              <i className="fa-solid fa-chevron-down text-slate-400"></i>
            </div>
          </button>
          
          {isPacksExpanded && (
            <div className="mt-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2">
              {packOptions.map((pack) => (
                <div key={pack.id} className="flex flex-col">
                  <div 
                    className={`flex items-center justify-between p-4 ${!pack.purchased ? 'opacity-50 cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
                    onClick={() => {
                      if (!pack.purchased) {
                        setLockedPackClicked(lockedPackClicked === pack.id ? null : pack.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 text-right">
                      <span className={`text-sm font-bold ${activeCategories.includes(pack.id as QuoteCategory) ? 'text-blue-700' : 'text-slate-600'}`}>
                        {pack.label}
                      </span>
                      {!pack.purchased && <i className="fa-solid fa-lock text-[10px] text-slate-400"></i>}
                    </div>
                    <button 
                      disabled={!pack.purchased}
                      onClick={(e) => {
                        if (pack.purchased) {
                          e.stopPropagation();
                          toggleCategory(pack.id as QuoteCategory);
                        }
                      }}
                      className={`w-11 h-6 rounded-full relative transition-colors ${activeCategories.includes(pack.id as QuoteCategory) ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${activeCategories.includes(pack.id as QuoteCategory) ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  {/* Shop Prompt for Locked Packs */}
                  {!pack.purchased && lockedPackClicked === pack.id && (
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-100 animate-in slide-in-from-top-2">
                      <span className="text-xs text-slate-500 font-medium">החבילה זמינה לרכישה בחנות</span>
                      <button 
                        onClick={onOpenShop}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors"
                      >
                        לחנות <i className="fa-solid fa-store mr-1"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isPacksExpanded && !stats.isSportsPackPurchased && !stats.isCinemaPackPurchased && (
            <p className="text-[10px] text-slate-400 font-bold mt-2 px-2 text-center animate-in fade-in">חבילות תוכן חדשות זמינות בחנות!</p>
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
                        <div className="flex flex-col p-4 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-right">
                  <i className={`fa-solid fa-bell text-lg ${notificationsEnabled ? 'text-yellow-500' : 'text-slate-300'}`}></i>
                  <span className="font-bold text-slate-800 text-sm">התראות חידון יומי</span>
                </div>
                <button onClick={onNotificationsToggle} className={`w-11 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {notificationsEnabled && (
                <div className="flex items-center justify-between pl-2 pr-8 animate-in fade-in slide-in-from-top-2">
                  <span className="text-xs font-bold text-slate-500">שעת התראה:</span>
                  <input 
                    type="time" 
                    value={notificationTime} 
                    onChange={(e) => onNotificationTimeChange(e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1 font-mono"
                  />
                </div>
              )}
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
