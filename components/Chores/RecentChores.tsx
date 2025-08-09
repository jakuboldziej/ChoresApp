import { useChores } from '@/app/(context)/ChoresContext';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function RecentChores() {
  const { chores } = useChores();

  return (
    <View className='gap-2 w-full'>
      <Text className='text-black font-bold text-2xl'>Najnowsze obowiązki</Text>

      <ScrollView className='w-full self-start'>
        {chores && chores.length > 0 && chores.map((chore) => (
          <View key={chore._id} className='w-full bg-cyan-200 p-2 rounded-xl'>
            <Text className='text-xl font-semibold'>{chore.title}</Text>
            <Text className='text-sm'>{chore.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}