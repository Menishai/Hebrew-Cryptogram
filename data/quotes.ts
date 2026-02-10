
import { Difficulty } from "../types";

export interface LocalQuote {
  quote: string;
  author: string;
  category: 'proverb' | 'song' | 'source' | 'famous';
  difficulty: Difficulty;
  year?: string;
}

export const QUOTES_DB: LocalQuote[] = [
  // --- EASY (Modern, Songs, Simple Proverbs) ---
  { quote: "היה אתה השינוי שאתה רוצה לראות בעולם", author: "מהטמה גנדי", category: 'famous', difficulty: Difficulty.EASY, year: "המאה ה-20" },
  { quote: "מסע של אלף מייל מתחיל בצעד אחד", author: "לאו דזה", category: 'famous', difficulty: Difficulty.EASY, year: "סין העתיקה" },
  { quote: "אם תרצו אין זו אגדה", author: "בנימין זאב הרצל", category: 'famous', difficulty: Difficulty.EASY, year: "1902" },
  { quote: "אין חכם כבעל ניסיון", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "לתת את הנשמה ואת הלב", author: "בעז שרעבי", category: 'song', difficulty: Difficulty.EASY, year: "1984" },
  { quote: "עוף גוזל חתוך את השמיים", author: "אריק איינשטיין", category: 'song', difficulty: Difficulty.EASY, year: "1987" },
  { quote: "מי שמאמין לא מפחד את האמונה לאבד", author: "אייל גולן", category: 'song', difficulty: Difficulty.EASY, year: "2010" },
  { quote: "יש דברים שרציתי לומר", author: "יהודה פוליקר", category: 'song', difficulty: Difficulty.EASY, year: "1985" },
  { quote: "לא כל הנוצץ זהב הוא", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "אין כמו בבית", author: "הקוסם מארץ עוץ", category: 'famous', difficulty: Difficulty.EASY, year: "1939" },
  { quote: "אל תסתכל בקנקן אלא במה שיש בו", author: "חז״ל", category: 'source', difficulty: Difficulty.EASY },
  { quote: "ואהבת לרעך כמוך", author: "התורה", category: 'source', difficulty: Difficulty.EASY },
  { quote: "סוף מעשה במחשבה תחילה", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "חיים ומוות ביד הלשון", author: "ספר משלי", category: 'source', difficulty: Difficulty.EASY },
  { quote: "כל ההתחלות קשות", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "הזמן עושה את שלו", author: "אברהם טל", category: 'song', difficulty: Difficulty.EASY },
  { quote: "שלום עליכם מלאכי השרת", author: "פיוט", category: 'source', difficulty: Difficulty.EASY },
  { quote: "מי שחלם לו ונשאר לו החלום", author: "נעמי שמר", category: 'song', difficulty: Difficulty.EASY },
  { quote: "הכי פשוט להיות פשוט", author: "עמיר בניון", category: 'song', difficulty: Difficulty.EASY },
  { quote: "ואהבת לרעך כמוך זה כלל גדול בתורה", author: "רבי עקיבא", category: 'source', difficulty: Difficulty.EASY },

  // --- MEDIUM (Standard Bible, Proverbs, Modern Quotes) ---
  { quote: "טובים השניים מן האחד", author: "קהלת", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "כל העולם כולו גשר צר מאוד", author: "רבי נחמן", category: 'source', difficulty: Difficulty.MEDIUM, year: "המאה ה-18" },
  { quote: "מים רבים לא יוכלו לכבות את האהבה", author: "שיר השירים", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "לך אל הנמלה עצל ראה דרכיה וחכם", author: "משלי", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "יגעת ומצאת תאמין", author: "חז״ל", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "אין חדש תחת השמש", author: "קהלת", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "צדק צדק תרדוף", author: "ספר דברים", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "איזהו עשיר השמח בחלקו", author: "פרקי אבות", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "חוסך שבטו שונא בנו", author: "ספר משלי", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "הכל צפוי והרשות נתונה", author: "רבי עקיבא", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "מכל מלמדי השכלתי", author: "תהילים", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "בור ששתית ממנו אל תזרוק בו אבן", author: "חז״ל", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "קול קורא במדבר", author: "ספר ישעיהו", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "דברים שרואים משם לא רואים מכאן", author: "יהודית רביץ", category: 'song', difficulty: Difficulty.MEDIUM },
  { quote: "האדם חושב ואלוהים צוחק", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.MEDIUM },
  { quote: "כל אחד הוא אור קטן וכולנו אור איתן", author: "שיר חנוכה", category: 'song', difficulty: Difficulty.MEDIUM },
  { quote: "אל תגידו יום יבוא הביאו את היום", author: "שיר לשלום", category: 'song', difficulty: Difficulty.MEDIUM },
  { quote: "יפה שתיקה לחכמים קל וחומר לטיפשים", author: "חז״ל", category: 'source', difficulty: Difficulty.MEDIUM },

  // --- HARD (Aramaic, Longer, Deep Sources) ---
  { quote: "סייג לחוכמה שתיקה", author: "רבי עקיבא", category: 'source', difficulty: Difficulty.HARD, year: "תקופת התנאים" },
  { quote: "תפסת מרובה לא תפסת", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "תקופת המשנה" },
  { quote: "הבא להורגך השכם להורגו", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "תקופת המשנה" },
  { quote: "איסתרא בלגינא קיש קיש קריא", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "תקופת התלמוד" },
  { quote: "די לחכימא ברמיזא", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "ארמית עתיקה" },
  { quote: "יצא שכרו בהפסדו", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "נאה דורש נאה מקיים", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "טלית שכולה תכלת", author: "מדרש תנחומא", category: 'source', difficulty: Difficulty.HARD },
  { quote: "קירח מכאן ומכאן", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "אחד בפה ואחד בלב", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "לא מאהבת מרדכי אלא משנאת המן", author: "מדרש אסתר רבה", category: 'source', difficulty: Difficulty.HARD },
  { quote: "שלח לחמך על פני המים", author: "קהלת", category: 'source', difficulty: Difficulty.HARD },
  { quote: "סור מרע ועשה טוב בקש שלום ורדפהו", author: "תהילים", category: 'source', difficulty: Difficulty.HARD },
  { quote: "אין הנחתום מעיד על עיסתו", author: "מדרש תנחומא", category: 'source', difficulty: Difficulty.HARD },
  { quote: "חכמת נשים בנתה ביתה", author: "ספר משלי", category: 'source', difficulty: Difficulty.HARD },
  { quote: "כל עכבה לטובה", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.HARD },

  // --- VERY_HARD (Complex Aramaic, Rare Proverbs, Longer Ancient Texts) ---
  { quote: "מאיגרא רמא לבירא עמיקתא", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD, year: "ארמית - תקופת התלמוד" },
  { quote: "כל דאלים גבר", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD, year: "תקופת התלמוד" },
  { quote: "עולם כמנהגו נוהג", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "גירסא דינקותא לא משתכחא", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "בוצין בוצין מקטפיה ידיע", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "חזות הכל", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.VERY_HARD },
  { quote: "מי שטרח בערב שבת יאכל בשבת", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "אל תדין את חברך עד שתגיע למקומו", author: "הלל הזקן", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "חנוך לנער על פי דרכו", author: "ספר משלי", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "שקר החן והבל היופי", author: "ספר משלי", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "מעט מן האור דוחה הרבה מן החושך", author: "בעל התניא", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "אין הבור מתמלא מחולייתו", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "איזהו גיבור הכובש את יצרו", author: "פרקי אבות", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "מרבה נכסים מרבה דאגה", author: "פרקי אבות", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "על שלושה דברים העולם עומד", author: "פרקי אבות", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "דרך ארץ קדמה לתורה", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "כל ישראל ערבים זה בזה", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
];
