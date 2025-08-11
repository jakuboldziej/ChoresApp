import { getUser } from '@/lib/fetch/users';
import React, { useEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface FriendsListProps {
  receivedFriendsRequests: string[];
}

export default function FriendsList({ receivedFriendsRequests }: FriendsListProps) {

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let usersDisplayNames: string[] = [];

        receivedFriendsRequests.map(async (userId) => {
          const response = await getUser(userId);
        });
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Błąd", "Błąd w otrzymaniu zaproszeń");
        }
      }
    };

    if (receivedFriendsRequests) fetchRequests();
  }, [receivedFriendsRequests]);

  return (
    <View className='w-screen self-start p-4 gap-4'>
      <Text className="text-3xl font-bold text-left">Przychodzące zaproszenia</Text>

      <ScrollView className="flex-1 p-4">
      </ScrollView>
    </View>
  )
}
