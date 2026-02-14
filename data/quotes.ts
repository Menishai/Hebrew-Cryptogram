
import { Difficulty, QuoteCategory } from "../types";

export interface LocalQuote {
  quote: string;
  author: string;
  category: QuoteCategory;
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
  { quote: "אל תסתכל בקנקן אלא במה שיש בו", author: "חז״ל", category: 'source', difficulty: Difficulty.EASY },
  { quote: "ואהבת לרעך כמוך", author: "התורה", category: 'source', difficulty: Difficulty.EASY },
  { quote: "סוף מעשה במחשבה תחילה", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "חיים ומוות ביד הלשון", author: "ספר משלי", category: 'source', difficulty: Difficulty.EASY },
  { quote: "כל ההתחלות קשות", author: "פתגם עממי", category: 'proverb', difficulty: Difficulty.EASY },
  { quote: "הזמן עושה את שלו", author: "אברהם טל", category: 'song', difficulty: Difficulty.EASY },

  // --- MEDIUM (Standard Bible, Proverbs, Modern Quotes) ---
  { quote: "טובים השניים מן האחד", author: "קהלת", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "כל העולם כולו גשר צר מאוד", author: "רבי נחמן", category: 'source', difficulty: Difficulty.MEDIUM, year: "המאה ה-18" },
  { quote: "מים רבים לא יוכלו לכבות את האהבה", author: "שיר השירים", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "לך אל הנמלה עצל ראה דרכיה וחכם", author: "משלי", category: 'source', difficulty: Difficulty.MEDIUM, year: "תקופת המקרא" },
  { quote: "יגעת ומצאת תאמין", author: "חז״ל", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "אין חדש תחת השמש", author: "קהלת", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "צדק צדק תרדוף", author: "ספר דברים", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "איזהו עשיר השמח בחלקו", author: "פרקי אבות", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "מכל מלמדי השכלתי", author: "תהילים", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "בור ששתית ממנו אל תזרוק בו אבן", author: "חז״ל", category: 'source', difficulty: Difficulty.MEDIUM },
  { quote: "דברים שרואים משם לא רואים מכאן", author: "יהודית רביץ", category: 'song', difficulty: Difficulty.MEDIUM },
  { quote: "אל תגידו יום יבוא הביאו את היום", author: "שיר לשלום", category: 'song', difficulty: Difficulty.MEDIUM },

  // --- HARD (Aramaic, Longer, Deep Sources) ---
  { quote: "סייג לחוכמה שתיקה", author: "רבי עקיבא", category: 'source', difficulty: Difficulty.HARD, year: "תקופת התנאים" },
  { quote: "תפסת מרובה לא תפסת", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "תקופת המשנה" },
  { quote: "הבא להורגך השכם להורגו", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "איסתרא בלגינא קיש קיש קריא", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "תקופת התלמוד" },
  { quote: "די לחכימא ברמיזא", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD, year: "ארמית עתיקה" },
  { quote: "נאה דורש נאה מקיים", author: "חז״ל", category: 'source', difficulty: Difficulty.HARD },
  { quote: "לא מאהבת מרדכי אלא משנאת המן", author: "מדרש אסתר רבה", category: 'source', difficulty: Difficulty.HARD },
  { quote: "שלח לחמך על פני המים", author: "קהלת", category: 'source', difficulty: Difficulty.HARD },
  { quote: "אין הנחתום מעיד על עיסתו", author: "מדרש תנחומא", category: 'source', difficulty: Difficulty.HARD },

  // --- VERY_HARD (Complex Aramaic, Rare Proverbs, Longer Ancient Texts) ---
  { quote: "מאיגרא רמא לבירא עמיקתא", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD, year: "ארמית - תקופת התלמוד" },
  { quote: "כל דאלים גבר", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD, year: "תקופת התלמוד" },
  { quote: "עולם כמנהגו נוהג", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "מי שטרח בערב שבת יאכל בשבת", author: "חז״ל", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "אל תדין את חברך עד שתגיע למקומו", author: "הלל הזקן", category: 'source', difficulty: Difficulty.VERY_HARD },
  { quote: "מרבה נכסים מרבה דאגה", author: "פרקי אבות", category: 'source', difficulty: Difficulty.VERY_HARD },

  // --- SPORTS CATEGORY (ספורט) ---
  { quote: "ככה לא בונים חומה", author: "יורם ארבל", category: 'sports', difficulty: Difficulty.MEDIUM, year: "1989" },
  { quote: "אנחנו על המפה ואנחנו נשארים על המפה", author: "טל ברודי", category: 'sports', difficulty: Difficulty.EASY, year: "1977" },
  { quote: "כדורגל משחקים תשעים דקות ובסוף גרמניה מנצחת", author: "גארי ליניקר", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "הכדור הוא עגול", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "הטבלה לא משקרת", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "זה לא נגמר עד שזה לא נגמר", author: "יוגי ברה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "לדרבי חוקים משלו", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "אנחנו מסתכלים ממשחק למשחק", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "בספורט כמו בספורט", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "אל אל ישראל", author: "עידוד", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "כל משחק הוא גמר גביע", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "הקהל הוא השחקן השנים עשר", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "לעולם לא תצעד לבד", author: "עידוד", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "מי שלא קופץ צהוב", author: "עידוד", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "ניצחון הוא לא הכל הוא הדבר היחיד", author: "וינס לומברדי", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "משחקים בונקר", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "הכל פתוח עד שריקת הסיום", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "כדורגל משחקים משבת לשבת", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "זה היה שער של פעם בחיים", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "הפסדנו בכבוד", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "העיקר ההשתתפות", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "הכדור בידיים שלנו", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "זה לא נגמר עד שהגברת השמנה שרה", author: "קלישאה", category: 'sports', difficulty: Difficulty.MEDIUM },
  { quote: "לכל שבת יש מוצאי שבת", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "אנחנו באים לנצח", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },
  { quote: "סוס מנצח לא מחליפים", author: "קלישאה", category: 'sports', difficulty: Difficulty.EASY },

  // --- CINEMA & TV CATEGORY (קולנוע וטלוויזיה) ---
  { quote: "גבעת חלפון אינה עונה", author: "ויקטור חסון", category: 'cinema', difficulty: Difficulty.EASY, year: "1976" },
  { quote: "העולם מצחיק אז צוחקים", author: "הגשש החיוור", category: 'cinema', difficulty: Difficulty.EASY },
  { quote: "מה שעובד בשביל רוסיה לא עובד בשביל קזבלן", author: "קזבלן", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1973" },
  { quote: "הוא לא ידע שהיא כזו", author: "חגיגה בסנוקר", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1975" },
  { quote: "אתה הבנת את זה ברוך", author: "הגשש החיוור", category: 'cinema', difficulty: Difficulty.EASY },
  { quote: "דבר חלש", author: "ארץ נהדרת", category: 'cinema', difficulty: Difficulty.EASY },
  { quote: "מה זה השטויות האלה", author: "עדי אשכנזי", category: 'cinema', difficulty: Difficulty.MEDIUM },
  { quote: "אני עוד אחזור", author: "שליחות קטלנית", category: 'cinema', difficulty: Difficulty.EASY, year: "1984" },
  { quote: "יוסטון יש לנו בעיה", author: "אפולו 13", category: 'cinema', difficulty: Difficulty.EASY, year: "1995" },
  { quote: "שהכוח יהיה איתך", author: "מלחמת הכוכבים", category: 'cinema', difficulty: Difficulty.EASY, year: "1977" },
  { quote: "החיים הם כמו קופסת שוקולד", author: "פורסט גאמפ", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1994" },
  { quote: "אלמנטרי ווטסון יקירי", author: "שרלוק הולמס", category: 'cinema', difficulty: Difficulty.MEDIUM },
  { quote: "אתה מדבר אלי", author: "נהג מונית", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1976" },
  { quote: "אין מקום כמו הבית", author: "הקוסם מארץ עוץ", category: 'cinema', difficulty: Difficulty.EASY, year: "1939" },
  { quote: "אני אשבור לו את הידיים ואת הרגליים", author: "צ'רלי וחצי", category: 'cinema', difficulty: Difficulty.HARD, year: "1974" },
  { quote: "אני הולך להציע לו הצעה שהוא לא יוכל לסרב לה", author: "הסנדק", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1972" },
  { quote: "אנחנו נזדקק לסירה גדולה יותר", author: "מלתעות", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1975" },
  { quote: "תמיד יהיה לנו את פריז", author: "קזבלנקה", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1942" },
  { quote: "אני מלך העולם", author: "טיטניק", category: 'cinema', difficulty: Difficulty.EASY, year: "1997" },
  { quote: "אף אחד לא שם את בייבי בפינה", author: "ריקוד מושחת", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1987" },
  { quote: "אני רואה אנשים מתים", author: "החוש השישי", category: 'cinema', difficulty: Difficulty.EASY, year: "1999" },
  { quote: "וואקנדה לנצח", author: "הפנתר השחור", category: 'cinema', difficulty: Difficulty.EASY, year: "2018" },
  { quote: "האמת היא שאתה לא יכול לעמוד באמת", author: "בחורים טובים", category: 'cinema', difficulty: Difficulty.HARD, year: "1992" },
  { quote: "לנצח ולתמיד", author: "צעצוע של סיפור", category: 'cinema', difficulty: Difficulty.EASY, year: "1995" },
  { quote: "או שתעשו או שלא. אין דבר כזה לנסות", author: "יודה", category: 'cinema', difficulty: Difficulty.MEDIUM, year: "1980" },
  { quote: "יש לי הרגשה שאנחנו כבר לא בקנזס", author: "הקוסם מארץ עוץ", category: 'cinema', difficulty: Difficulty.MEDIUM },
  { quote: "היה שלום ותודה על הדגים", author: "מדריך הטרמפיסט לגלקסיה", category: 'cinema', difficulty: Difficulty.HARD },
  { quote: "בונד ג'יימס בונד", author: "ג'יימס בונד", category: 'cinema', difficulty: Difficulty.EASY },
  { quote: "יש לי הרגשה רעה לגבי זה", author: "מלחמת הכוכבים", category: 'cinema', difficulty: Difficulty.MEDIUM },
  { quote: "יחי המלך החדש", author: "מלך האריות", category: 'cinema', difficulty: Difficulty.EASY },
  { quote: "התשובה היא ארבעים ושתיים", author: "מדריך הטרמפיסט לגלקסיה", category: 'cinema', difficulty: Difficulty.MEDIUM },
  { quote: "כאן מסתכלים עליך ילד", author: "קזבלנקה", category: 'cinema', difficulty: Difficulty.HARD },
];
