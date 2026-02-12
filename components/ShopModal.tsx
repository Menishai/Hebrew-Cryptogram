
import React from 'react';

interface ShopItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  price: string;
  reward: number | 'special';
  color: string;
  tag?: string;
  gradient: string;
  borderColor: string;
}

interface ShopModalProps {
  onClose: () => void;
  onPurchaseHints: (amount: number) => void;
  onPurchaseRemoveAds: () => void;
  isAdFree: boolean;
  hintsRemaining: number;
}

const ShopModal: React.FC<ShopModalProps> = ({ 
  onClose, 
  onPurchaseHints, 
  onPurchaseRemoveAds, 
  isAdFree,
  hintsRemaining 
}) => {
  const items: ShopItem[] = [
    { 
      id: 'hints_10', 
      title: 'חבילת 10 רמזים', 
      desc: 'עזרה קלה לדרך', 
      icon: 'fa-lightbulb', 
      price: '₪3.90', 
      reward: 10, 
      color: 'text-amber-500',
      gradient: 'from-amber-50 to-white',
      borderColor: 'border-amber-100'
    },
    { 
      id: 'hints_50', 
      title: 'חבילת 50 רמזים', 
      desc: 'החבילה המבוקשת ביותר', 
      icon: 'fa-sparkles', 
      price: '₪12.90', 
      reward: 50, 
      color: 'text-blue-600',
      tag: 'פופולרי',
      gradient: 'from-blue-50 to-white',
      borderColor: 'border-blue-100'
    },
    { 
      id: 'hints_100', 
      title: 'חבילת 100 רמזים', 
      desc: 'לאלופים שרוצים הכל', 
      icon: 'fa-crown', 
      price: '₪19.90', 
      reward: 100, 
      color: 'text-purple-600',
      tag: 'משתלם',
      gradient: 'from-purple-50 to-white',
      borderColor: 'border-purple-100'
    },
    { 
      id: 'remove_ads', 
      title: 'גרסת הפרימיום', 
      desc: 'ביטול פרסומות לנצח', 
      icon: 'fa-shield-halved', 
      price: '₪9.90', 
      reward: 'special', 
      color: 'text-emerald-600',
      gradient: 'from-emerald-50 to-white',
      borderColor: 'border-emerald-100'
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-slate-900/60 transition-all duration-500" dir="rtl" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col relative border-4 border-white max-h-[92dvh] w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/30 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-200/30 blur-[80px] rounded-full"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all z-30 shadow-sm"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 shrink-0 text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[1.75rem] flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl shadow-amber-200 border-4 border-white">
            <i className="fa-solid fa-gem"></i>
          </div>
          <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight">חנות האלוף</h2>
          <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] mt-2">Premium Store & Boosts</p>
        </div>

        {/* Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar pb-6 relative z-10">
          {items.map((item) => {
            const isAdsItem = item.id === 'remove_ads';
            const disabled = isAdsItem && isAdFree;

            return (
              <button
                key={item.id}
                disabled={disabled}
                onClick={() => {
                  if (isAdsItem) onPurchaseRemoveAds();
                  else onPurchaseHints(item.reward as number);
                }}
                className={`w-full p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all text-right relative group overflow-hidden ${
                  disabled 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed' 
                    : `bg-gradient-to-l ${item.gradient} ${item.borderColor} hover:shadow-lg active:scale-[0.98]`
                }`}
              >
                {item.tag && (
                  <div className="absolute top-0 right-10 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-b-xl shadow-sm z-10">
                    {item.tag.toUpperCase()}
                  </div>
                )}
                
                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-50 ${item.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>

                <div className="flex-1">
                  <div className="font-[900] text-slate-900 text-base md:text-lg leading-tight flex items-center gap-2">
                    {item.title}
                    {disabled && <i className="fa-solid fa-circle-check text-emerald-500 text-sm"></i>}
                  </div>
                  <div className="text-[11px] md:text-[12px] text-slate-500 font-bold leading-tight mt-1">{item.desc}</div>
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black text-sm shrink-0 shadow-md transition-colors ${
                  disabled 
                  ? 'bg-slate-200 text-slate-400 shadow-none' 
                  : 'bg-slate-900 text-white group-hover:bg-blue-600'
                }`}>
                  {disabled ? 'בבעלותך' : item.price}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Area */}
        <div className="px-8 py-6 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 shrink-0 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-6 py-2.5 rounded-full shadow-sm border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">יתרת רמזים</span>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-lg font-[1000] text-amber-600 flex items-center gap-1.5">
              {hintsRemaining}
              <i className="fa-solid fa-lightbulb"></i>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
            לתשומת לבך: הרכישות הן לצורכי המחשה בלבד.<br/>
            <span className="opacity-60">לא יתבצע חיוב כספי אמיתי בחשבונך.</span>
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default ShopModal;
