import AddChore from "@/components/Chores/AddChore";
import RecentChores from "@/components/Chores/RecentChores";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 items-center pt-10 p-2 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-4">
        Chores App
      </Text>

      <View className="w-full gap-4 flex-1">
        <AddChore />
        <RecentChores />
      </View>
    </SafeAreaView>
  );
}
