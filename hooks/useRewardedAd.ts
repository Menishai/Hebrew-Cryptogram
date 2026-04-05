import { useState, useEffect, useCallback, useRef } from 'react';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

export const useRewardedAd = (onReward: () => void) => {
  const [isAdReady, setIsAdReady] = useState(false);
  
  // טריק למניעת לופים: שומרים את הפונקציה בזיכרון עוקף-רינדור
  const onRewardRef = useRef(onReward);
  useEffect(() => {
    onRewardRef.current = onReward;
  }, [onReward]);

  useEffect(() => {
    let isMounted = true;

    const initAdMob = async () => {
      try {
        await AdMob.initialize();
        
AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => { // <-- הוספנו את המילה כאן!
          if (isMounted) {
            onRewardRef.current(); // קוראים לפונקציה השמורה
            loadAd();
            console.log('Reward received:', reward);
          }
        });

        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (isMounted) loadAd();
        });

        loadAd();
      } catch (error) {
        console.error("AdMob initialization failed", error);
      }
    };

    const loadAd = async () => {
      setIsAdReady(false);
      try {
        await AdMob.prepareRewardVideoAd({
          adId: 'ca-app-pub-2120452826670758/6883154495', 
          isTesting: true
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
  }, []); // <--- המערך הריק הזה הוא מה שעוצר את הלופ!

  const showAd = useCallback(async () => {
    if (isAdReady) {
      await AdMob.showRewardVideoAd();
    }
  }, [isAdReady]);

  return { isAdReady, showAd };
};