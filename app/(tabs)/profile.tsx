import { schedulePushNotification } from "@/lib/notifications";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../(context)/AuthContext";
import { useFriends } from "../(context)/FriendsContext";

export default function ProfileScreen() {
  const { signOut, user } = useSession();
  const {
    pendingRequests,
    sentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest
  } = useFriends();

  const [friendCode, setFriendCode] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const handleSendRequest = async () => {
    if (!friendCode.trim()) {
      Alert.alert('Błąd', 'Wprowadź kod znajomego');
      return;
    }

    const success = await sendFriendRequest(friendCode.trim());
    if (success) {
      setFriendCode('');
    }
  };

  const handleAcceptRequest = (friendDisplayName: string) => {
    acceptFriendRequest(friendDisplayName);
  };

  const handleDeclineRequest = (friendDisplayName: string) => {
    declineFriendRequest(friendDisplayName);
  };

  const handleCancelRequest = (friendDisplayName: string) => {
    cancelFriendRequest(friendDisplayName);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
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
              className="p-4 bg-slate-500 rounded-xl"
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

        <View className="mb-6 mt-6 px-3">
          <Text className="text-lg font-semibold mb-2">Dodaj znajomego</Text>
          <View className="flex-row">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
              placeholder="Kod znajomego"
              value={friendCode}
              onChangeText={setFriendCode}
            />
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={handleSendRequest}
            >
              <Text className="text-white font-semibold">Wyślij</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingRequests.length > 0 && (
          <View className="mb-6 px-3">
            <Text className="text-lg font-semibold mb-2">
              Oczekujące zaproszenia ({pendingRequests.length})
            </Text>
            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View className="bg-gray-50 p-3 rounded-lg mb-2 flex-row justify-between items-center">
                  <Text className="font-medium">{item.displayName}</Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className="bg-green-500 px-3 py-1 rounded mr-2"
                      onPress={() => handleAcceptRequest(item.displayName)}
                    >
                      <Text className="text-white text-sm">Akceptuj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-500 px-3 py-1 rounded"
                      onPress={() => handleDeclineRequest(item.displayName)}
                    >
                      <Text className="text-white text-sm">Odrzuć</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {sentRequests.length > 0 && (
          <View className="mb-6 px-3">
            <Text className="text-lg font-semibold mb-2">
              Wysłane zaproszenia ({sentRequests.length})
            </Text>
            <FlatList
              data={sentRequests}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View className="bg-gray-50 p-3 rounded-lg mb-2 flex-row justify-between items-center">
                  <Text className="font-medium">{item.displayName}</Text>
                  <TouchableOpacity
                    className="bg-orange-500 px-3 py-1 rounded"
                    onPress={() => handleCancelRequest(item.displayName)}
                  >
                    <Text className="text-white text-sm">Anuluj</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        className="bg-red-500 px-6 py-3 rounded-lg self-center"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold">Wyloguj się</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}