import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { AndroidImportance, getExpoPushTokenAsync, getPermissionsAsync, requestPermissionsAsync, SchedulableTriggerInputTypes, scheduleNotificationAsync, setNotificationCategoryAsync, setNotificationChannelAsync } from "expo-notifications";
import { Platform } from "react-native";

// Check if running in Expo Go
const isExpoGo = Constants.expoConfig?.slug && Constants.expoConfig?.slug === 'choresapp';

export const schedulePushNotification = async (title: string, body: string, data: Record<string, unknown>) => {
  await scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

export const registerForPushNotificationsAsync = async (userId: string) =>  {
  let token;

  if (isExpoGo) {
    console.log('Skipping push notifications setup in Expo Go');
    return null;
  }

  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('myNotificationChannel', {
      name: 'ChoresApp Notifications',
      importance: AndroidImportance.MAX, 
      vibrationPattern: [0, 250, 250, 250], 
      lightColor: '#FF231F7C',
      sound: 'default', 
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: 1,
      bypassDnd: true, 
    });
  }

  await setNotificationCategoryAsync('chore_notification', [
    {
      identifier: 'view_chore',
      buttonTitle: 'Zobacz',
      options: {
        opensAppToForeground: true,
      },
    },
    // {
    //   identifier: 'mark_done',
    //   buttonTitle: 'Gotowe',
    //   options: {
    //     opensAppToForeground: false,
    //   },
    // }
  ]);

  if (Device.isDevice) {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}