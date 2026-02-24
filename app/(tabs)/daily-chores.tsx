import ChoreModal from '@/components/Chores/ChoreModal'
import DisplayChores from '@/components/Chores/DisplayChores'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DailyChoresScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-10">
          <Text className="text-4xl font-bold text-gray-800">Dzisiejsze</Text>
          <Text className="text-gray-500 text-lg">Zresetują się o północy</Text>
        </View>

        <View className='w-full flex-1 pt-6'>
          <DisplayChores
            currentScreen="chores-daily"
            pFinished={false}
          />

          <Text className="font-semibold text-2xl pl-6 mt-4 text-gray-400">Ukończone:</Text>
          <DisplayChores
            currentScreen="chores-daily"
            pFinished={true}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-10 right-10 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <ChoreModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        mode="add"
        currentScreen="chores-daily"
      />
    </SafeAreaView>
  );
}