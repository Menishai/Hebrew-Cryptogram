
import React, { useState } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "ברוכים הבאים!",
      description: "מוכנים לפצח את הצופן? 'אלוף הצופן' הוא משחק של היגיון, מילים והשראה שבו עליכם לחשוף ציטוטים מפורסמים.",
      icon: "fa-hand-sparkles",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      example: (
        <div className="flex gap-2 mt-4 animate-bounce">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">א</div>
          <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white font-black text-xl">ל</div>
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-black text-xl">ו</div>
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-xl">ף</div>
        </div>
      )
    },
    {
      title: "איך זה עובד?",
      description: "כל אות מיוצגת על ידי מספר קבוע. אם גיליתם ש-12 הוא האות 'א', כל המשבצות עם המספר 12 יתמלאו בבת אחת!",
      icon: "fa-hashtag",
      color: "text-blue-500",
      bg: "bg-blue-50",
      example: (
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-14 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-600 font-black text-2xl shadow-sm">א</div>
              <span className="text-[10px] font-black text-blue-600 mt-1">12</span>
            </div>
            <div className="flex items-center text-slate-300"><i className="fa-solid fa-arrow-left"></i></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-14 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-black text-2xl opacity-40">?</div>
              <span className="text-[10px] font-black text-slate-400 mt-1">12</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">ניחוש אחד מעדכן את כל המספרים הזהים!</span>
        </div>
      )
    },
    {
      title: "משבצות נעולות",
      description: "נתקלתם במנעול? אי אפשר לנחש אותן ישירות. פתחו קודם אות צמודה (מימין או משמאל) כדי לשחרר את הנעילה.",
      icon: "fa-lock",
      color: "text-slate-700",
      bg: "bg-slate-100",
      example: (
        <div className="flex gap-2 p-4 bg-slate-200/50 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="w-12 h-14 bg-slate-100 border-2 border-slate-300 rounded-xl flex items-center justify-center text-slate-400 relative">
             <i className="fa-solid fa-lock scale-110"></i>
          </div>
          <div className="w-12 h-14 bg-white border-2 border-green-400 rounded-xl flex items-center justify-center text-green-500 font-black text-2xl shadow-sm animate-pulse">
            ב
          </div>
        </div>
      )
    },
    {
      title: "צבירת רמזים",
      description: "רמזים הם המשאב היקר ביותר שלכם! הם נשמרים בין השלבים וניתן לזכות בהם על ידי ניצחונות או השלמת הישגים.",
      icon: "fa-gift",
      color: "text-amber-500",
      bg: "bg-amber-50",
      example: (
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md border border-amber-100">
           <i className="fa-solid fa-lightbulb text-amber-500 text-xl animate-pulse"></i>
           <div className="flex flex-col items-start">
              <span className="text-xs font-black text-amber-700">בונוס רמה קשה:</span>
              <span className="text-[10px] font-bold text-amber-500">2 ניצחונות = 1 רמז</span>
           </div>
        </div>
      )
    },
    {
      title: "ביטול פעולה (Undo)",
      description: "טעיתם? לחצו על כפתור הביטול. שימו לב: כל ביטול פעולה עולה רמז אחד, אז השתמשו בזה בחוכמה!",
      icon: "fa-arrow-rotate-left",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      example: (
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-inner border border-indigo-200">
          <i className="fa-solid fa-arrow-rotate-left"></i>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-500" dir="rtl" style={{ fontSize: '16px' }}>
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center relative overflow-hidden border-b-8 border-blue-500">
        {/* Close Button */}
        <button 
          onClick={onComplete}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
          aria-label="סגור"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 flex flex-row">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-sm ${current.bg} ${current.color} transition-all duration-300`}>
          <i className={`fa-solid ${current.icon}`}></i>
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-3">{current.title}</h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 font-medium px-2">
          {current.description}
        </p>

        {/* Visual Example Container */}
        <div className="mb-8 w-full h-24 flex items-center justify-center">
           {current.example}
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={nextStep}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {step === steps.length - 1 ? (
              <>
                <span>בואו נתחיל!</span>
                <i className="fa-solid fa-play text-xs"></i>
              </>
            ) : "המשך"}
          </button>
          
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2 text-sm"
            >
              חזור
            </button>
          )}
        </div>

        <div className="mt-8 flex gap-1.5">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
