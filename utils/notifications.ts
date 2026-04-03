import { LocalNotifications } from '@capacitor/local-notifications';

export const setupDailyNotification = async (enabled: boolean, timeString: string) => {
  try {
    // Cancel existing notification
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    if (!enabled) {
      return;
    }

    // Request permissions
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Parse timeString (e.g., "10:30")
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Schedule new notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "אלוף הצופן",
          body: "החידון היומי של היום מחכה לך. בוא לפצח את הצופן!",
          id: 1,
          schedule: {
            on: {
              hour: hour,
              minute: minute
            },
            allowWhileIdle: true,
          },
          smallIcon: "ic_stat_icon_config_sample", // Optional, will use default if not found
        }
      ]
    });
    console.log(`Notification scheduled for ${hour}:${minute}`);
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};
