import DisplayChores from '@/components/Chores/DisplayChores'
import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChoresScreen() {
  return (
    <SafeAreaView className="flex-1 items-center pt-10 p-2 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-4">Twoje Obowiązki</Text>

      <View className='w-full flex-1'>
        <DisplayChores currentScreen="chores-screen" />
      </View>
    </SafeAreaView>
  )
}
