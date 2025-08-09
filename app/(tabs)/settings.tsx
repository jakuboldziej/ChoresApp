import AddFriends from "@/components/Profile/AddFriends";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../(context)/AuthContext";

export default function SettingsScreen() {
  const { signOut, user } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-between pt-10 p-2 bg-white">
      <View>
        <Text className="text-4xl font-bold text-gray-800 mb-4 text-center">Profil</Text>

        <Text className="text-lg text-gray-600 mb-8 text-center">
          Zalogowany jako: {user ? user.displayName : ''}
          {user?.guest && <Text className="text-sm text-orange-500"> (Gość)</Text>}
        </Text>

        {user?.guest && (
          <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <Text className="text-orange-800 text-sm text-center">
              Jesteś zalogowany jako gość. Niektóre funkcje mogą być ograniczone.
            </Text>
          </View>
        )}

        <AddFriends />
      </View>

      <TouchableOpacity
        className="bg-red-500 px-6 py-3 rounded-lg"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold">Wyloguj się</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}