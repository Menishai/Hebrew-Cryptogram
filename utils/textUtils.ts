
export const FINAL_TO_BASE: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

export const normalizeHebrewChar = (c: string): string => FINAL_TO_BASE[c] || c;

export const isHebrewLetter = (char: string): boolean => /[א-ת]/.test(char);

export const isEventTime = (now: Date) => {
  const day = now.getDay();
  const hour = now.getHours();
  
  if (day === 4 && hour >= 18) return true; // Thursday >= 18:00
  if (day === 5 || day === 6) return true;  // Friday, Saturday
  if (day === 0 && hour < 9) return true;   // Sunday < 09:00
  
  return false;
};