import { useState, useEffect, useCallback, useRef } from 'react';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

export const useRewardedAd = (onReward: () => void) => {
  const [isAdReady, setIsAdReady] = useState(false);
  
  // שומרים את הפונקציה בזיכרון עוקף-רינדור
  const onRewardRef = useRef(onReward);
  useEffect(() => {
    onRewardRef.current = onReward;
  }, [onReward]);

  useEffect(() => {
    let isMounted = true;
    let hasEarnedReward = false; // משתנה עזר שמסמן אם צפו בהצלחה בוידאו

    const initAdMob = async () => {
      try {
        await AdMob.initialize();
        
        // מנקים מאזינים קודמים ליתר ביטחון
        AdMob.removeAllListeners();
        
        // מאזין 1: המשתמש צפה מספיק וזכה ברמז (לא מעדכנים פה את הסטייט!)
        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          hasEarnedReward = true; 
          console.log('Reward flagged, waiting for close...', reward);
        });

        // מאזין 2: הפרסומת נסגרה. עכשיו בטוח לחלק את הרמז
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (isMounted) {
            // רק אם הוא באמת סיים לצפות, נחלק את הרמז
            if (hasEarnedReward) {
              onRewardRef.current(); 
              hasEarnedReward = false; // איפוס לפעם הבאה
            }
            
            // טוענים פרסומת חדשה בשקט ברקע
            setTimeout(() => {
              loadAd();
            }, 500);
          }
        });

        // טעינה ראשונית של פרסומת
        loadAd();
      } catch (error) {
        console.error("AdMob initialization failed", error);
      }
    };

    const loadAd = async () => {
      setIsAdReady(false);
      try {
        await AdMob.prepareRewardVideoAd({
          adId: 'ca-app-pub-2120452826670758/6883154495', // זה הקוד האמיתי שלך
          isTesting: false // חשוב! הורדנו מ-testing ל-false
        });
        if (isMounted) setIsAdReady(true);
      } catch (error) {
        console.error("Failed to load ad", error);
      }
    };

    initAdMob();

    return () => {
      isMounted = false;
      AdMob.removeAllListeners();
    };
  }, []); 

  const showAd = useCallback(async () => {
    if (isAdReady) {
      await AdMob.showRewardVideoAd();
    }
  }, [isAdReady]);

  return { isAdReady, showAd };
};