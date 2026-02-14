
import { LocalQuote } from "./quotes";
import { Difficulty } from "../types";

// Curated pool for February 2026
// Keys are "YYYY-MM-DD"
export const SPECIAL_DAILY_QUOTES: Record<string, Omit<LocalQuote, 'category' | 'difficulty'>> = {
  "2026-02-01": { quote: "כל התחלה היא רק הזדמנות חדשה", author: "עממי" },
  "2026-02-14": { quote: "מים רבים לא יוכלו לכבות את האהבה", author: "שיר השירים" },
  "2026-02-28": { quote: "סוף מעשה במחשבה תחילה", author: "פתגם עממי" },
  // More specific ones can be added here. 
  // If a date isn't here, the deterministic generator will pick from the main DB.
};
