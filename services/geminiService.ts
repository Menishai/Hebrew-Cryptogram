
import { GoogleGenAI, Type } from "@google/genai";
import { GameLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a cryptogram puzzle by fetching a quote from Gemini 
 * and processing the mapping/pre-filled logic locally for speed.
 */
export const generateCryptogramPuzzle = async (numToReveal: number = 3, excludedQuotes: string[] = []): Promise<GameLevel> => {
  const exclusionPrompt = excludedQuotes.length > 0 
    ? `\nאל תשתמש באף אחד מהציטוטים הבאים: ${excludedQuotes.join(', ')}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `ספק אחד מהבאים בעברית (עד 60 תווים): ציטוט מעורר השראה של אדם מפורסם, פתגם עברי עממי מוכר, או שורה איקונית משיר ישראלי ידוע. כלול את שם הכותב/המבצע ואת השנה או התקופה אם ידועה. החזר בפורמט JSON בלבד.${exclusionPrompt}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING, description: "הטקסט בעברית ללא ניקוד." },
          author: { type: Type.STRING, description: "שם הכותב, המבצע או המקור (למשל 'פתגם עממי')." },
          year: { type: Type.STRING, description: "השנה או התקופה (אופציונלי).", nullable: true }
        },
        required: ["quote", "author"]
      },
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  const { quote, author, year } = JSON.parse(response.text || '{}');
  const cleanQuote = (quote || '').trim();
  
  if (!cleanQuote) {
    throw new Error("Received empty quote from API");
  }

  // 1. Generate local mapping (1 to 22 for Hebrew alphabet)
  const letterToNum: Record<string, number> = {};
  const finalToBase: Record<string, string> = {
    'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'
  };

  const uniqueLetters = new Set<string>();
  for (const char of cleanQuote) {
    if (/[א-ת]/.test(char)) {
      uniqueLetters.add(finalToBase[char] || char);
    }
  }

  // Create a pool of numbers from 1 to 22
  const numbers = Array.from({ length: 22 }, (_, i) => i + 1);
  // Shuffle numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Assign numbers to base letters
  const baseLetterArray = Array.from(uniqueLetters);
  baseLetterArray.forEach((letter, index) => {
    letterToNum[letter] = numbers[index % 22];
  });

  // Map final letters to the same number as their base letters
  Object.entries(finalToBase).forEach(([final, base]) => {
    if (letterToNum[base]) {
      letterToNum[final] = letterToNum[base];
    }
  });

  // 2. Select prefilled indices
  const letterPositions: number[] = [];
  for (let i = 0; i < cleanQuote.length; i++) {
    if (/[א-ת]/.test(cleanQuote[i])) {
      letterPositions.push(i);
    }
  }

  const revealedIndices: number[] = [];
  if (letterPositions.length > 0) {
    const shuffledPositions = [...letterPositions].sort(() => Math.random() - 0.5);
    const seenLetters = new Set<string>();
    for (const pos of shuffledPositions) {
      const char = cleanQuote[pos];
      const baseChar = finalToBase[char] || char;
      if (!seenLetters.has(baseChar)) {
        revealedIndices.push(pos);
        seenLetters.add(baseChar);
      }
      if (revealedIndices.length >= numToReveal) break;
    }
    
    // Fallback if we couldn't find enough unique letters
    if (revealedIndices.length < Math.min(numToReveal, letterPositions.length)) {
       for (const pos of shuffledPositions) {
         if (!revealedIndices.includes(pos)) {
           revealedIndices.push(pos);
         }
         if (revealedIndices.length >= numToReveal) break;
       }
    }
  }

  return {
    quote: cleanQuote,
    author: author || "אלמוני",
    year: year || undefined,
    mapping: letterToNum,
    revealedIndices
  };
};
