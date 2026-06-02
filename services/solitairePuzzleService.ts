import { GameLevel, Difficulty } from '../types';
import { isHebrewLetter, normalizeHebrewChar, FINAL_TO_BASE } from '../utils/textUtils';

const SOLITAIRE_QUOTES = [
    {
    quote: "רק שני דברים הם אינסופיים: היקום והטמטום האנושי, ואני עדיין לא בטוח לגבי הראשון.",
    author: "אלברט איינשטיין",
    year: "1930"
  },
    {
    quote: "לעולם אל תפריע לאויב שלך כשהוא עושה טעות.",
    author: "נפוליאון בונפרטה",
    year: ""
  },
    {
    quote: "אושר הוא כאשר מה שאתה חושב, מה שאתה אומר ומה שאתה עושה נמצאים בהרמוניה.",
    author: "מאהטמה גנדי",
    year: ""
  },
    {
    quote: "אנחנו יודעים מה אנחנו, אך לא מה היינו יכולים להיות.",
    author: "וויליאם שייקספיר",
    year: ""
  },
    {
    quote: "התאבדות היא דרכנו לומר לאלוהים: 'אתה לא יכול לפטר אותי, אני מתפטר'",
    author: "ביל מאהר",
    year: ""
  },
    {
    quote: "יש רק דרך אחת להימנע מביקורת: אל תעשה כלום, אל תגיד כלום ואל תהיה כלום.",
    author: "אריסטו",
    year: ""
  },
    {
    quote: "לחיות הוא אחד הדברים הנדירים ביותר, רוב האנשים פשוט קיימים.",
    author: "אוסקר וויילד",
    year: ""
  },
    {
    quote: "צבא של עכברים עליהם מפקד אריה יכול לעשות יותר מצבא של אריות עליו מפקד עכבר.",
    author: "נפוליאון בונפרטה",
    year: ""
  },
    {
    quote: "אנחנו לא מפסיקים להנות כי אנו מזדקנים, אנו מזדקנים מכיוון שאנחנו מפסיקים להנות.",
    author: "ג'ורג' ברנרד שו",
    year: ""
  },
    {
    quote: "עדיף לשמור על שתיקה ולהיראות אידיוט, מאשר לפתוח את הפה ולהוכיח את זה.",
    author: "מארק טוויין",
    year: ""
  },
    {
    quote: "מי שחושב כי הכסף יכול לעשות הכול, יש לחשוד בו שיהיה מוכן לעשות הכול בשביל כסף.",
    author: "בנג'מין פרנקלין",
    year: ""
  },
    {
    quote: "אהבה יכולה לשלח אותנו לגן עדן או לגיהנום, אך היא תמיד לוקחת אותנו לאנשהו.",
    author: "פאולו קואלו",
    year: ""
  },
    {
    quote: "אהבת אמת זה כשאתה לא מצליח להירדם כי המציאות שלך טובה מחלומותייך.",
    author: "ד''ר סוס",
    year: ""
  },
    {
    quote: "פסימיסט רואה את הקושי בכל הזדמנות: אופטימיסט רואה את ההזדמנות בכל קושי.",
    author: "ווינסטון צ'רצ'יל",
    year: ""
  },
    {
    quote: "במציאות מספר הדתות בעולם הוא כמספר בני האדם שבו.",
    author: "מאהטמה גנדי",
    year: ""
  },
    {
    quote: "אלוהים יצר את המלחמה כדי שאמריקאים ילמדו גיאוגרפיה.",
    author: "מארק טוויין",
    year: ""
  },
    {
    quote: "אנשים טובעים לא על ידי נפילה לנהר, אלא על ידי הישארות במים.",
    author: "פאולו קואלו",
    year: ""
  },
    {
    quote: "ידע אינו ערובה להתנהגות טובה, אבל בורות היא ערובה ודאית להתנהגות רעה.",
    author: "מרתה נוסבאום",
    year: ""
  },
    {
    quote: "האיש ששואל שאלה הוא טיפש לרגע, האיש שלא שואל הוא טיפש לכל החיים.",
    author: "קונפוציוס",
    year: ""
  },
    {
    quote: "החיים הם מה שקורה לך בזמן שאתה עסוק בלעשות תוכניות אחרות.",
    author: "ג'ון לנון",
    year: ""
  },
    {
    quote: "אנו מכריזים בזאת על הקמת מדינה יהודית בארץ ישראל – היא מדינת ישראל.",
    author: "דוד בן-גוריון",
    year: "1948"
  },
    {
    quote: "לא משנה כמה לאט אתם הולכים, כל עוד אתם לא עוצרים.",
    author: "קונפוציוס",
    year: "1930"
  },
    {
    quote: "אנשים שקטים הם בעלי המוחות הקולניים ביותר.",
    author: "סטיבן הוקינג",
    year: ""
  },
    {
    quote: "עתידנו אינו תלוי במה יאמרו הגויים, אלא במה יעשו היהודים.",
    author: "דוד בן-גוריון",
    year: "1955"
  },
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
  },
  {
    quote: "מי שמעולם לא עשה טעות, מעולם לא ניסה משהו חדש.",
    author: "אלברט איינשטיין",
    year: ""
  },
  {
    quote: "הצלחה היא היכולת לעבור מכישלון לכישלון מבלי לאבד את ההתלהבות.",
    author: "וינסטון צ'רצ'יל",
    year: ""
  },
  {
    quote: "האושר של חייך תלוי באיכות המחשבות שלך.",
    author: "מרקוס אורליוס",
    year: ""
  },
  {
    quote: "אם אתה יכול לחלום על זה, אתה יכול לעשות את זה.",
    author: "וולט דיסני",
    year: ""
  },
  {
    quote: "הדברים היפים ביותר בעולם אינם ניתנים לראייה או למגע, יש להרגיש אותם בלב.",
    author: "הלן קלר",
    year: ""
  },
  {
    quote: "בארץ ישראל, אדם שלא מאמין בנסים הוא אדם לא ריאלי",
    author: "דוד בן-גוריון",
    year: ""
  },
  {
    quote: "עם שאינו יודע את עברו, ההווה שלו דל ועתידו לוט בערפל.",
    author: "יגאל אלון",
    year: ""
  },
  {
    quote: "אין חירות לאדם בלי חירות לאומה.",
    author: "זאב ז'בוטינסקי",
    year: ""
  },
  {
    quote: "מלחמה היא נמנעת, השלום הוא בלתי נמנע.",
    author: "מנחם בגין",
    year: ""
  },
  {
    quote: "תאמין שאתה יכול ואתה כבר נמצא בחצי הדרך לשם.",
    author: "תיאודור רוזוולט",
    year: ""
  },
  {
    quote: "בכל דבר, ההצלחה תלויה בהכנה מוקדמת, ובלי הכנה כזו הכישלון מובטח.",
    author: "קונפוציוס",
    year: ""
  },
  {
    quote: "אנו מביטים כל כך הרבה זמן ובכל כך הרבה חרטה על הדלת שנסגרה, שאנו לא מבחינים בזו שנפתחה עבורנו",
    author: "אלכסנדר גרהם בל",
    year: ""
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
    let targetRevealCount = Math.max(6, Math.floor(totalLetters * 0.10));
  
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
    mapping,
    lockedIndices: [],   // No locked cells in solitaire mode
    revealedIndices,
    maxMistakes: 3,
    isDaily: false
  };
};