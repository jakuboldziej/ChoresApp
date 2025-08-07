import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 p-6">
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg font-bold text-gray-800 mb-4">
          Welcome to ChoresApp!
        </Text>
        <Text className="text-base text-gray-600 text-center px-4">
          NativeWind is now configured and ready to use.
        </Text>
      </View>
    </SafeAreaView>
  );
}
