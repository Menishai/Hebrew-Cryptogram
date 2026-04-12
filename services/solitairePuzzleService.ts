import { GameLevel, Difficulty } from '../types';
import { isHebrewLetter } from '../utils/textUtils';

const SOLITAIRE_QUOTES = [
  {
    quote: "החיים הם כמו רכיבה על אופניים, כדי לשמור על שיווי משקל אתה חייב להמשיך לנוע",
    author: "אלברט איינשטיין",
    year: "1930"
  },
  {
    quote: "הדרך הטובה ביותר לחזות את העתיד היא להמציא אותו",
    author: "פיטר דרוקר",
    year: "1960"
  },
  {
    quote: "אל תסתכל על השעון, עשה מה שהוא עושה - תמשיך ללכת",
    author: "סם לבנסון",
    year: "1950"
  }
];

export const generateSolitairePuzzle = (difficulty: Difficulty, quoteIndex: number): GameLevel => {
  const index = quoteIndex % SOLITAIRE_QUOTES.length;
  const selected = SOLITAIRE_QUOTES[index];

    // Create a mapping for the cryptogram
  const hebrewLetterIndices = selected.quote.split('')
    .map((char, i) => ({ char, i }))
    .filter(item => isHebrewLetter(item.char));
    
  const uniqueLetters = Array.from(new Set(hebrewLetterIndices.map(item => item.char)));
  const numbers = Array.from({ length: 22 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  const mapping: Record<string, number> = {};
  uniqueLetters.forEach((char, i) => {
    mapping[char] = numbers[i % numbers.length];
  });

  // Logic for revealed letters
  const totalLetters = hebrewLetterIndices.length;
  let revealCount = 0;
  
  if (totalLetters > 50) {
    // 7-10% revealed
    const percentage = 0.07 + (Math.random() * 0.03);
    revealCount = Math.floor(totalLetters * percentage);
  } else {
    // For shorter quotes, reveal a small fixed amount (e.g., 2-4 letters)
    revealCount = Math.min(4, Math.max(2, Math.floor(totalLetters * 0.08)));
  }

  const revealedIndices: number[] = [];
  const availableIndices = [...hebrewLetterIndices];
  
  for (let i = 0; i < revealCount && availableIndices.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    revealedIndices.push(availableIndices[randomIndex].i);
    availableIndices.splice(randomIndex, 1);
  }
  
  // Basic cryptogram generation logic (simplified for solitaire)
  return {
    id: `solitaire-${index}-${Date.now()}`,
    quote: selected.quote,
    author: selected.author,
    year: selected.year,
    difficulty,
    mapping,
    lockedIndices: [],   // No locked cells in solitaire mode
    revealedIndices,
    maxMistakes: 3,
    isDaily: false
  };
};