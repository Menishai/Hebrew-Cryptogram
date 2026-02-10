
export const FINAL_TO_BASE: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

export const normalizeHebrewChar = (c: string): string => FINAL_TO_BASE[c] || c;

export const isHebrewLetter = (char: string): boolean => /[א-ת]/.test(char);
