
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
      desc: 'עזרה קטנה כשנתקעים', 
      icon: 'fa-lightbulb', 
      price: '₪3.90', 
      reward: 10, 
      color: 'text-amber-500' 
    },
    { 
      id: 'hints_50', 
      title: 'חבילת 50 רמזים', 
      desc: 'החבילה הפופולרית ביותר', 
      icon: 'fa-box-open', 
      price: '₪12.90', 
      reward: 50, 
      color: 'text-blue-500',
      tag: 'פופולרי'
    },
    { 
      id: 'hints_100', 
      title: 'חבילת 100 רמזים', 
      desc: 'לאלוף צופן אמיתי', 
      icon: 'fa-crown', 
      price: '₪19.90', 
      reward: 100, 
      color: 'text-purple-600',
      tag: 'משתלם'
    },
    { 
      id: 'remove_ads', 
      title: 'ביטול פרסומות', 
      desc: 'משחק נקי וללא הפרעות', 
      icon: 'fa-ban', 
      price: '₪9.90', 
      reward: 'special', 
      color: 'text-rose-500' 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-300" dir="rtl" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col relative border-b-8 border-amber-500 max-h-[90dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header - Fixed */}
        <div className="text-center mb-6 shrink-0 pt-2">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm border border-amber-100">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800">חנות האלוף</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Hint Shop & Premium</p>
        </div>

        {/* Scrollable Items Area */}
        <div className="flex-1 overflow-y-auto px-1 space-y-3 custom-scrollbar pb-2">
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
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 md:gap-4 transition-all text-right relative ${
                  disabled 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed' 
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 active:scale-[0.98] shadow-sm'
                }`}
              >
                {item.tag && (
                  <div className="absolute -top-2 -right-1 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {item.tag}
                  </div>
                )}
                
                <div className={`w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-xl ${item.color}`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-black text-slate-800 text-sm md:text-base leading-tight">
                    {item.title}
                    {disabled && <span className="mr-2 text-green-600 text-[10px] block md:inline">(כבר רכשת!)</span>}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-slate-400 font-bold leading-tight mt-0.5">{item.desc}</div>
                </div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-black text-xs shrink-0">
                  {item.price}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer - Fixed */}
        <div className="mt-6 pt-4 border-t border-slate-100 shrink-0 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500">יתרת רמזים:</span>
            <span className="text-sm font-black text-amber-600 flex items-center gap-1">
              {hintsRemaining}
              <i className="fa-solid fa-lightbulb"></i>
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium text-center leading-relaxed">
            הרכישות באפליקציה הן סימולטיביות.<br/>התשלום לא יבוצע באמת.
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ShopModal;
