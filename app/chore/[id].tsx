import { useChores } from '@/app/(context)/ChoresContext';
import ChoreModal from '@/components/Chores/ChoreModal';
import UserDisplayName from '@/components/UserDisplayName';
import { findChoreUser } from '@/lib/choreUtils';
import { formatIntervalDisplay } from '@/lib/intervalUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../(context)/AuthContext';

export default function ChoreDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useSession();
  const { chores, handleChoreFinished, handleChoreDelete, fetchData, isLoading } = useChores();
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    setFetchAttempted(false);
  }, [id]);

  useEffect(() => {
    const choreExists = chores.some(c => c._id === id);

    if (!choreExists && !fetchAttempted && !isLoading && !localLoading) {
      setLocalLoading(true);
      setFetchAttempted(true);
      fetchData().finally(() => setLocalLoading(false));
    }
  }, [id, chores, fetchData, isLoading, localLoading, fetchAttempted]);

  const chore = chores.find(c => c._id === id);

  const intervalLabel = formatIntervalDisplay({
    isRepeatable: chore?.isRepeatable || false,
    intervalType: chore?.intervalType,
    customDays: chore?.customDays
  });

  const currentUserInChore = chore && user ?
    findChoreUser(chore, user.displayName) :
    null;

  if ((isLoading || localLoading) && !chore) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-lg text-gray-600 mt-4">Ładowanie obowiązku...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chore && fetchAttempted && !isLoading && !localLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl text-gray-600 mb-2">Nie znaleziono obowiązku</Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            Obowiązek mógł zostać usunięty lub nie masz do niego dostępu
          </Text>
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

  if (!chore) return null;

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
        <View className={`p-6 rounded-xl mb-6 ${chore.finished === true ? "bg-green-400" : "bg-cyan-200"}`}>
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-800">{chore.title}</Text>

            {/* Frequency Badge */}
            <View className="flex-row items-center mt-2">
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-medium">{intervalLabel}</Text>
              </View>

              {/* Status Badge */}
              <View className={`ml-2 px-3 py-1 rounded-full ${chore.finished ? 'bg-green-100' : 'bg-orange-100'}`}>
                <Text className={`font-medium ${chore.finished ? 'text-green-700' : 'text-orange-700'}`}>
                  {chore.finished ? 'Wykonane w tym cyklu' : 'Do zrobienia'}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="text-gray-500 uppercase text-xs font-bold mb-1">Opis</Text>
            <Text className="text-gray-700 text-lg">
              {chore.description || "Brak opisu."}
            </Text>
          </View>

          {chore.isRepeatable === false && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Przypisani użytkownicy ({chore.usersList.length}):
              </Text>
              <View className="bg-white p-3 rounded-lg mb-2">
                {chore.usersList.length > 0 ? (
                  <Text className="text-gray-800">
                    {chore.usersList.map((user, index) => (
                      <React.Fragment key={user.displayName}>
                        <UserDisplayName
                          userDisplayName={user.displayName}
                          userFinished={user.finished}
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
          )}

          <Text className='text-sm self-end text-slate-500'>
            Utworzono: {chore.createdAt && new Date(chore.createdAt).toLocaleString()}
          </Text>
        </View>

        <View className="gap-3">
          {user && currentUserInChore && (
            <TouchableOpacity
              className={`p-4 rounded-lg bg-blue-500`}
              onPress={() => {
                if (chore._id) {
                  handleChoreFinished(chore._id, user.displayName);
                  router.back();
                }
              }}
            >
              {currentUserInChore && currentUserInChore.finished === true ? (
                <Text className="text-white font-semibold text-center">Odznacz wykonanie</Text>
              ) : (
                <Text className="text-white font-semibold text-center">Oznacz jako wykonane</Text>
              )}
            </TouchableOpacity>
          )}

          {user && chore.ownerId === user._id && (
            <View className="gap-3">
              <TouchableOpacity
                className="bg-gray-500 p-4 rounded-lg"
                onPress={() => setIsEditModalVisible(true)}
              >
                <Text className="text-white font-semibold text-center">Edytuj obowiązek</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 p-4 rounded-lg"
                onPress={async () => {
                  if (chore._id) {
                    handleChoreDelete(chore._id, true);
                  }
                }}
              >
                <Text className="text-white font-semibold text-center">Usuń obowiązek</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ChoreModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        mode="edit"
        editChore={chore}
      >
        <></>
      </ChoreModal>
    </SafeAreaView>
  );
}
