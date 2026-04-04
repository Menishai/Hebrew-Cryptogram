import { useEffect, useState } from 'react';
import { Purchases, LOG_LEVEL, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';

// שים לב: כאן נכנס המפתח האמיתי שלך שמתחיל ב-goog_
const REVENUECAT_API_KEY = "goog_mchiMxIdnbKMbRMdGxfWwOLWPLE"; 

export const useBilling = () => {
  const [isReady, setIsReady] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    const initBilling = async () => {
      try {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        
        // מושך את סטטוס המשתמש (למשל, כדי לדעת אם הוא כבר VIP)
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info.customerInfo);

        // מושך את "חלון הראווה" (ה-Offering שנקרא default) עם 7 החבילות שלך
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
          // שומר את החבילות בסטייט כדי שנוכל להציג אותן במסך
          setPackages(offerings.current.availablePackages);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error("שגיאה באתחול RevenueCat:", error);
      }
    };

    initBilling();
  }, []);

  // פונקציית הרכישה שמופעלת כשהמשתמש לוחץ על קנייה
  const buyPackage = async (pack: PurchasesPackage) => {
    try {
      console.log(`מנסה לקנות: ${pack.product.identifier}`);
      const { customerInfo: updatedInfo } = await Purchases.purchasePackage({ aPackage: pack });
      
      // מעדכן את הסטייט עם הנתונים החדשים (למשל אם נוספה לו זכאות VIP)
      setCustomerInfo(updatedInfo);
      
      return { success: true, identifier: pack.product.identifier };
    } catch (error: any) {
      if (error.code === 'PURCHASE_CANCELLED') {
        console.log("המשתמש ביטל את הרכישה");
      } else {
        console.error("שגיאה ברכישה:", error);
      }
      return { success: false, identifier: null };
    }
  };

  // פונקציה חובה לשחזור רכישות
  const restorePurchases = async () => {
    try {
      const { customerInfo: updatedInfo } = await Purchases.restorePurchases();
      setCustomerInfo(updatedInfo);
      return true;
    } catch (error) {
      console.error("שגיאה בשחזור רכישות:", error);
      return false;
    }
  };

  // פונקציות עזר קטנות לבדיקת זכאויות (Entitlements)
  const isPremium = customerInfo?.entitlements.active['premium'] !== undefined;
  const hasCinema = customerInfo?.entitlements.active['cinema'] !== undefined;
  const hasSport = customerInfo?.entitlements.active['sport'] !== undefined;
  const hasSkipForever = customerInfo?.entitlements.active['skip_forever'] !== undefined;

  return { 
    isReady, 
    packages, // המערך של 7 המוצרים שיוצג בחנות
    buyPackage, 
    restorePurchases,
    isPremium,
    hasCinema,
    hasSport,
    hasSkipForever
  };
};