import ChoreModal from "@/components/Chores/ChoreModal";
import DisplayChores from "@/components/Chores/DisplayChores";
import Ionicons from "@expo/vector-icons/Ionicons";
import { addNotificationReceivedListener, addNotificationResponseReceivedListener } from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../(context)/AuthContext";
import { useChores } from "../(context)/ChoresContext";

export default function Index() {
  const { fetchData } = useChores();
  const { user } = useSession();
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="pt-10 mb-6">
          <Text className="text-4xl font-extrabold text-gray-900">Cześć, {user?.displayName}!</Text>
          <Text className="text-gray-500 text-lg">Oto Twoje plany na dziś.</Text>
        </View>

        <View className="mb-8">
          <View className="flex-row items-center mb-4 gap-2">
            <Ionicons name="repeat" size={24} color="#2563eb" />
            <Text className="text-xl font-bold text-gray-800">Twoja Rutyna</Text>
          </View>
          <DisplayChores
            currentScreen="index"
            typeFilter="repeatable"
          />
        </View>

        <View>
          <View className="flex-row items-center mb-4 gap-2">
            <Ionicons name="list" size={24} color="#0891b2" />
            <Text className="text-xl font-bold text-gray-800">Zadania do zrobienia</Text>
          </View>
          <DisplayChores
            currentScreen="index"
            typeFilter="one-off"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-10 right-10 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-2xl"
        onPress={() => setIsModalVisible(true)}
        style={{ elevation: 10 }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <ChoreModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        mode="add"
        currentScreen="index"
      />
    </SafeAreaView>
  );
}
