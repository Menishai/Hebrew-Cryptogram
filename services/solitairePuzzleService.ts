import { GameLevel, Difficulty } from '../types';
import { isHebrewLetter, normalizeHebrewChar, FINAL_TO_BASE } from '../utils/textUtils';

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

  // Create a mapping for the cryptogram using the original quote
  const hebrewLetterIndices = selected.quote.split('')
    .map((char, i) => ({ char, i }))
    .filter(item => isHebrewLetter(item.char));
    
  // Get unique base letters
  const uniqueLetters = Array.from(new Set(hebrewLetterIndices.map(item => normalizeHebrewChar(item.char))));
  const numbers = Array.from({ length: 22 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  const mapping: Record<string, number> = {};
  uniqueLetters.forEach((char, i) => {
    const num = numbers[i % numbers.length];
    mapping[char] = num;
    
    // Also map the final letter to the same number
    Object.entries(FINAL_TO_BASE).forEach(([final, base]) => {
      if (base === char) {
        mapping[final] = num;
      }
    });  });

  // Logic for revealed letters
  const totalLetters = hebrewLetterIndices.length;
   
  // Base reveal count: at least 5, or ~8% for longer quotes
    let targetRevealCount = Math.max(5, Math.floor(totalLetters * 0.08));
  
  // Ensure the remaining (missing) letters are a multiple of 5
  while ((totalLetters - targetRevealCount) % 5 !== 0) {
    targetRevealCount++;
  }
  
  // Cap at totalLetters just in case
  targetRevealCount = Math.min(targetRevealCount, totalLetters);

  const revealedIndices: number[] = [];
    
  // Group available indices by letter
  const indicesByLetter: Record<string, number[]> = {};
  hebrewLetterIndices.forEach(({ char, i }) => {
    if (!indicesByLetter[char]) indicesByLetter[char] = [];
    indicesByLetter[char].push(i);
  });

  const availableUniqueLetters = Object.keys(indicesByLetter);
  
  // Shuffle available unique letters
  for (let i = availableUniqueLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableUniqueLetters[i], availableUniqueLetters[j]] = [availableUniqueLetters[j], availableUniqueLetters[i]];
  }

  let remainingToReveal = targetRevealCount;

  // 1. Try to pick unique letters first
  for (const char of availableUniqueLetters) {
    if (remainingToReveal === 0) break;
    
    const indices = indicesByLetter[char];
    const randomIndex = indices[Math.floor(Math.random() * indices.length)];
    revealedIndices.push(randomIndex);
    
    // Remove the chosen index
    indicesByLetter[char] = indices.filter(idx => idx !== randomIndex);
    
    remainingToReveal--;
  }

  // 2. If we still need to reveal more letters, pick randomly from the remaining indices
  if (remainingToReveal > 0) {
    const remainingIndices: number[] = [];
    Object.values(indicesByLetter).forEach(indices => {
      remainingIndices.push(...indices);
    });
    
    // Shuffle remaining indices
    for (let i = remainingIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingIndices[i], remainingIndices[j]] = [remainingIndices[j], remainingIndices[i]];
    }
    
    for (let i = 0; i < remainingToReveal && i < remainingIndices.length; i++) {
      revealedIndices.push(remainingIndices[i]);
    }
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