import { useChores } from '@/app/(context)/ChoresContext';
import UserDisplayName from '@/components/UserDisplayName';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChoreDetails() {
  const { id } = useLocalSearchParams();
  const { chores } = useChores();
  const router = useRouter();

  const chore = chores.find(c => c._id === id);


  if (!chore) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl text-gray-600">Nie znaleziono obowiązku</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Powrót</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2"
        >
          <Text className="text-blue-500 text-lg">← Powrót</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">Detale obowiązku</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
      >
        <View className="bg-cyan-50 p-6 rounded-xl mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            {chore.title}
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-2">Opis:</Text>
            <Text className="text-base text-gray-800 leading-6">
              {chore.description}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-2">Twórca:</Text>
            <UserDisplayName
              userId={chore.ownerId}
              className="text-base text-gray-800"
              fallback="Nieznany użytkownik"
              loadingText="Ładowanie..."
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Przypisani użytkownicy ({chore.usersList.length}):
            </Text>
            <View className="bg-white p-3 rounded-lg mb-2">
              {chore.usersList.length > 0 ? (
                <Text className="text-gray-800">
                  {chore.usersList.map((userId, index) => (
                    <React.Fragment key={userId}>
                      <UserDisplayName
                        userId={userId}
                        fallback="Nieznany użytkownik"
                        loadingText="Ładowanie..."
                      />
                      {index < chore.usersList.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </Text>
              ) : (
                <Text className="text-gray-500 italic">Brak przypisanych użytkowników</Text>
              )}
            </View>
          </View>
        </View>

        <View className="gap-3">
          <TouchableOpacity className="bg-blue-500 p-4 rounded-lg">
            <Text className="text-white font-semibold text-center">Oznacz jako wykonane</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-500 p-4 rounded-lg">
            <Text className="text-white font-semibold text-center">Edytuj obowiązek</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
