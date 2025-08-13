import ChoreModal from "@/components/Chores/ChoreModal";
import DisplayChores from "@/components/Chores/DisplayChores";
import { addNotificationReceivedListener, addNotificationResponseReceivedListener } from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChores } from "../(context)/ChoresContext";

export default function Index() {
  const { fetchData } = useChores();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const notificationListener = addNotificationReceivedListener(notification => {
      console.log("Received notification:", {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data
      });
    });

    const responseListener = addNotificationResponseReceivedListener(async (response) => {
      const choreData = response.notification.request.content.data;
      const choreId = choreData?.choreId as string;

      if (response.actionIdentifier === 'view_chore') {
        if (choreId) {
          router.push(`/chore/${choreId}`);
        } else {
          router.push('/(tabs)');
        }

      } else if (response.actionIdentifier === 'mark_done') {
        if (choreId) {

        }
      } else {
        if (choreId) {
          router.push(`/chore/${choreId}`);
        } else {
          router.push('/(tabs)');
        }
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [fetchData]);

  return (
    <SafeAreaView className="flex-1 items-center pt-10 p-2 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-4">Chores App</Text>

      <View className="w-full gap-4 flex-1">
        <ChoreModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          mode="add"
        >
          <TouchableOpacity
            className="self-center bg-blue-600 p-3 rounded-lg mt-4"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-white text-center font-semibold text-lg">Dodaj obowiązek</Text>
          </TouchableOpacity>
        </ChoreModal>

        <View className='gap-2 w-full flex-1'>
          <Text className='text-black font-bold text-2xl'>Najnowsze obowiązki</Text>
          <DisplayChores currentScreen="index" />
        </View>
      </View>
    </SafeAreaView>
  );
}
