import AddFriends from "@/components/Profile/AddFriends";
import FriendsList from "@/components/Profile/FriendsList";
import { getUser } from "@/lib/fetch/users";
import { schedulePushNotification } from "@/lib/notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../(context)/AuthContext";

export default function SettingsScreen() {
  const { signOut, user } = useSession();

  const [receivedFriendsRequests, setReceivedFriendsRequests] = useState<string[]>([]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  useEffect(() => {
    const fetchFriendsRequests = async () => {
      try {
        if (!user?.displayName) throw new Error("Użytkownik jest wymagany");

        const response = await getUser(user?.displayName);

        if (!response || !response?.friendsRequests) throw new Error("Błąd w odpowiedzi")

        console.log(response.friendsRequests.received)
        setReceivedFriendsRequests(response.friendsRequests.received);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Błąd", "Błąd w żądaniu o zaproszenia do znajomych")
        }
      }
    };

    if (user) fetchFriendsRequests();
  }, [user]);

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

        {user?.role === "admin" && (
          <View className="px-3">
            <Pressable
              className="p-4 bg-slate-500 rounded-xl w-fit"
              onPress={async () => {
                const data = { data: 'testowa data', test: { test1: 'more data' } };

                await schedulePushNotification(
                  "Testowe powiadomienie",
                  "To jest testowe powiadomienie",
                  data
                );
              }}
            >
              <Text>Test notifications</Text>
            </Pressable>
          </View>
        )}

        <AddFriends />
        {receivedFriendsRequests.length > 0 && <FriendsList receivedFriendsRequests={receivedFriendsRequests} />}
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