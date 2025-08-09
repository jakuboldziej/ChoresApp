import { useChores } from '@/app/(context)/ChoresContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function RecentChores() {
  const { chores, fetchData, isLoading } = useChores();
  const router = useRouter();

  const handleChorePress = (choreId: string) => {
    router.push({
      pathname: '/chore/[id]',
      params: { id: choreId }
    });
  };

  const onRefresh = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error('Error refreshing chores:', error);
    }
  }
  return (
    <View className='gap-2 w-full flex-1'>
      <Text className='text-black font-bold text-2xl'>Najnowsze obowiązki</Text>

      <ScrollView
        className='w-full flex-1'
        contentContainerStyle={{ flexGrow: 1, padding: 12 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {chores && chores.length > 0 && chores.map((chore) => (
          <TouchableOpacity
            key={chore._id}
            className='w-full bg-cyan-200 p-4 rounded-xl mb-3'
            onPress={() => chore._id && handleChorePress(chore._id)}
          >
            <Text className='text-xl font-semibold'>{chore.title}</Text>
            <Text
              className='text-sm overflow-hidden'
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chore.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
} 