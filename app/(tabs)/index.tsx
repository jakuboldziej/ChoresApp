import AddChore from "@/components/Chores/AddChore";
import DisplayChores from "@/components/Chores/DisplayChores";
import { registerForPushNotificationsAsync, schedulePushNotification } from "@/lib/notifications";
import { addNotificationReceivedListener, addNotificationResponseReceivedListener, getNotificationChannelsAsync, Notification, NotificationChannel } from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined
  );

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    const notificationListener = addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  return (
    <SafeAreaView className="flex-1 items-center pt-10 p-2 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-4">Chores App</Text>

      <View className="w-full gap-4 flex-1">
        <Text>Your expo push token: {expoPushToken}</Text>
        <Text>{`Channels: ${JSON.stringify(
          channels.map(c => c.id),
          null,
          2
        )}`}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>
        <Pressable
          className="p-4 bg-slate-500 rounded-xl w-fit"
          onPress={async () => {
            await schedulePushNotification();
          }}
        >
          <Text>Notification</Text>
        </Pressable>

        <AddChore />

        <View className='gap-2 w-full flex-1'>
          <Text className='text-black font-bold text-2xl'>Najnowsze obowiązki</Text>
          <DisplayChores currentScreen="index" />
        </View>
      </View>
    </SafeAreaView>
  );
}
