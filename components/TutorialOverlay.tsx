
import React, { useState } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [showDetailed, setShowDetailed] = useState(false);

  const steps = [
    {
      title: "ברוכים הבאים!",
      description: "מוכנים לפצח את הצופן? 'אלוף הצופן' הוא משחק של היגיון, מילים והשראה שבו עליכם לחשוף ציטוטים מפורסמים.",
      icon: "fa-hand-sparkles",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      example: (
        <div className="flex gap-2 animate-bounce">
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
        <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">א</div>
              <span className="text-[10px] font-black text-blue-600 mt-1">12</span>
            </div>
            <div className="flex items-center text-slate-300"><i className="fa-solid fa-arrow-left"></i></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-12 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-black text-xl opacity-40">?</div>
              <span className="text-[10px] font-black text-slate-400 mt-1">12</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-400 font-bold">ניחוש אחד מעדכן את כל המספרים הזהים!</span>
        </div>
      )
    },
    {
      title: "החידון היומי",
      description: "אתגר מיוחד שמתחלף כל יום. יש לכם בדיוק 3 ניסיונות לפצח אותו. נכשלתם? לא תוכלו לראות את הפתרון - אז תחשבו טוב!",
      icon: "fa-calendar-day",
      color: "text-rose-500",
      bg: "bg-rose-50",
      example: (
        <div className="flex gap-3 justify-center">
           <div className="w-12 h-14 bg-white border-2 border-rose-200 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden">
              <span className="text-2xl font-black text-rose-500">28</span>
              <div className="absolute top-0 w-full h-4 bg-rose-500"></div>
           </div>
           <div className="flex flex-col justify-center gap-1.5">
             <div className="flex gap-1">
               <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
               <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
               <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
             </div>
             <span className="text-[10px] font-bold text-slate-400">3 ניסיונות בלבד</span>
           </div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-500" dir="rtl" style={{ fontSize: '16px' }}>
      {/* Main Container - Fixed Size */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-md w-full h-[600px] md:h-[650px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col relative overflow-hidden border-b-8 border-blue-500">
        
        {/* Close Button */}
        <button 
          onClick={onComplete}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
          aria-label="סגור"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {showDetailed ? (
          <div className="flex flex-col h-full text-right pt-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">המדריך המלא</h2>
              <button onClick={() => setShowDetailed(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pl-4 space-y-8 text-slate-600 text-sm leading-relaxed custom-scrollbar pb-4">
              <section>
                <h3 className="text-lg font-black text-blue-600 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><i className="fa-solid fa-bullseye"></i></div>
                  המטרה
                </h3>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  המטרה שלכם היא לפענח ציטוט מפורסם שהוצפן. כל אות בציטוט הוחלפה במספר. עליכם לגלות איזו אות מסתתרת מאחורי כל מספר כדי לחשוף את המשפט המלא.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-black text-indigo-500 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center"><i className="fa-solid fa-gamepad"></i></div>
                  איך משחקים בפועל?
                </h3>
                <ul className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <li className="flex gap-3"><i className="fa-solid fa-1 text-indigo-400 mt-1"></i> <span>לחצו על משבצת ריקה בלוח.</span></li>
                  <li className="flex gap-3"><i className="fa-solid fa-2 text-indigo-400 mt-1"></i> <span>בחרו אות מהמקלדת שבתחתית המסך.</span></li>
                  <li className="flex gap-3"><i className="fa-solid fa-3 text-indigo-400 mt-1"></i> <span>אם צדקתם, האות תופיע <strong>בכל המשבצות</strong> בלוח שנושאות את אותו המספר!</span></li>
                  <li className="flex gap-3"><i className="fa-solid fa-4 text-indigo-400 mt-1"></i> <span>אם טעיתם, תצברו "פסילה" (טעות).</span></li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-black text-rose-500 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><i className="fa-solid fa-heart-crack"></i></div>
                  פסילות (טעויות)
                </h3>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  יש לכם מספר מוגבל של טעויות מותרות בכל שלב (תלוי ברמת הקושי). אם תעברו את מכסת הטעויות - תפסלו ותצטרכו להתחיל את השלב מחדש. שימו לב לאותיות שכבר ניחשתם, הן יסומנו במקלדת.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-black text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center"><i className="fa-solid fa-lock"></i></div>
                  משבצות נעולות
                </h3>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  חלק מהמשבצות מופיעות עם סמל של מנעול. <strong>לא ניתן ללחוץ עליהן או לנחש אותן ישירות!</strong> כדי לפתוח משבצת נעולה, עליכם לגלות את האות שנמצאת ממש לידה (מימין או משמאל). ברגע שתגלו את האות השכנה, המנעול יישבר ותוכלו לנחש גם אותה.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-black text-amber-500 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><i className="fa-solid fa-lightbulb"></i></div>
                  רמזים וביטול פעולה
                </h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <p>נתקעתם? תוכלו להשתמש ברמזים (סמל הנורה). רמזים מאפשרים לכם:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 pr-2">
                    <li>לחשוף אות ספציפית בלוח.</li>
                    <li>לפתוח משבצת נעולה מבלי לגלות את השכנה שלה.</li>
                    <li>לחשוף את שם המחבר של הציטוט.</li>
                  </ul>
                  <p className="pt-2 border-t border-slate-200">
                    בנוסף, אם עשיתם טעות ואתם רוצים להתחרט, תוכלו ללחוץ על כפתור ה<strong>ביטול (Undo)</strong>. שימו לב שכל ביטול עולה רמז אחד!
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-purple-500 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><i className="fa-solid fa-calendar-day"></i></div>
                  החידון היומי
                </h3>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  בכל יום מחכה לכם חידון חדש ומיוחד. בחידון היומי יש לכם <strong>רק 3 ניסיונות</strong> (פסילות) לפתור אותו. אם תיפסלו, לא תוכלו לנסות שוב באותו היום ולא תוכלו לראות את הפתרון.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-black text-emerald-500 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><i className="fa-solid fa-store"></i></div>
                  חנות והישגים
                </h3>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  ככל שתשחקו תצברו רמזים ותשלימו הישגים. בחנות תוכלו לרכוש חבילות ציטוטים מיוחדות (כמו ספורט או קולנוע), להסיר פרסומות או לקנות רמזים נוספים.
                </p>
              </section>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={onComplete}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <span>הבנתי הכל, בואו נשחק!</span>
                <i className="fa-solid fa-play text-xs"></i>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 flex flex-row">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Content Section - Stable Layout */}
            <div className="flex flex-col items-center w-full flex-1 pt-4">
              {/* Icon Area - Fixed Height */}
              <div className="h-24 flex items-center justify-center mt-2">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-sm ${current.bg} ${current.color} transition-all duration-300`}>
                  <i className={`fa-solid ${current.icon}`}></i>
                </div>
              </div>

              {/* Title & Description Area - Fixed Min Height to avoid jumping */}
              <div className="min-h-[140px] flex flex-col items-center mt-4 text-center">
                <h2 className="text-2xl font-black text-slate-800 mb-3">{current.title}</h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium px-2">
                  {current.description}
                </p>
              </div>

              {/* Visual Example Area - Fixed Height */}
              <div className="w-full h-32 flex items-center justify-center mt-4">
                 {current.example}
              </div>
            </div>

            {/* Bottom Section - Action Buttons */}
            <div className="w-full mt-auto flex flex-col gap-3">
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
              
              <div className="flex items-center justify-between px-2">
                <div className="w-16">
                  {step > 0 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
                    >
                      חזור
                    </button>
                  ) : null}
                </div>

                {/* Step Indicators */}
                <div className="flex gap-1.5 justify-center">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-200'}`}
                    />
                  ))}
                </div>

                <div className="w-16"></div>
              </div>

              {/* Link to detailed guide */}
              <button 
                onClick={() => setShowDetailed(true)}
                className="mt-2 text-blue-500 font-bold text-sm hover:text-blue-700 transition-colors underline decoration-blue-200 underline-offset-4 pb-2"
              >
                צריכים הסבר מפורט יותר?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
