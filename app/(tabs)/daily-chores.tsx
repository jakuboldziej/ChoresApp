import ChoreModal from '@/components/Chores/ChoreModal'
import DisplayChores from '@/components/Chores/DisplayChores'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DailyChoresScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 items-center pt-10 p-2 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-4">Twoje Dzienne Obowiązki</Text>

      <ChoreModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        mode="add"
        currentScreen="chores-daily"
      >
        <TouchableOpacity
          className="self-center bg-blue-600 p-3 rounded-lg mt-4"
          onPress={() => setIsModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold text-lg">Dodaj obowiązek</Text>
        </TouchableOpacity>
      </ChoreModal>

      <View className='w-full flex-1 pt-10'>
        <Text className="font-semibold text-3xl pl-4">Do zrobienia:</Text>

        <DisplayChores currentScreen="chores-daily" pFinished={false} />
      </View>

      <View className='w-full flex-1 pt-10'>
        <Text className="font-semibold text-3xl pl-4">Zrobione:</Text>

        <DisplayChores currentScreen="chores-daily" pFinished={true} />
      </View>
    </SafeAreaView>
  )
}