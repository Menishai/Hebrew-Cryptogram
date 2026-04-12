import { GameLevel, Difficulty } from '../types';

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

export const generateSolitairePuzzle = (difficulty: Difficulty): GameLevel => {
  const randomIndex = Math.floor(Math.random() * SOLITAIRE_QUOTES.length);
  const selected = SOLITAIRE_QUOTES[randomIndex];
  
  // Basic cryptogram generation logic (simplified for solitaire)
  return {
    id: `solitaire-${Date.now()}`,
    quote: selected.quote,
    author: selected.author,
    year: selected.year,
    difficulty,
    revealedIndices: [], // Start with nothing revealed for solitaire
    maxMistakes: 3,
    isDaily: false
  };
};