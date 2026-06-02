import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-digest", {
      name: "Daily Digest",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    await scheduleDailyDigest();
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === "granted") {
    await scheduleDailyDigest();
    return true;
  }

  return false;
}

export async function scheduleDailyDigest(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your tech digest is ready 📰",
      body: "See what's happening in tech today",
      data: { screen: "feed" },
      ...(Platform.OS === "android" ? { channelId: "daily-digest" } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}
