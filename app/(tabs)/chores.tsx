import ChoreModal from '@/components/Chores/ChoreModal'
import DisplayChores from '@/components/Chores/DisplayChores'
import FilterButton, { IntervalFilter } from '@/components/Chores/FilterButton'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const filters: { label: string; value: IntervalFilter }[] = [
  { label: "Wszystkie", value: "all" },
  { label: "Codzienne", value: "daily" },
  { label: "Tygodniowe", value: "weekly" },
  { label: "Miesięczne", value: "monthly" },
  { label: "Custom", value: "custom" }
];

export default function ChoresScreen() {
  const [intervalFilter, setIntervalFilter] = useState<IntervalFilter>("all")
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 pt-10 px-3 bg-white">
      <Text className="text-4xl font-bold text-gray-800 mb-6">
        Twoje Obowiązki
      </Text>

      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="repeat" size={22} color="#2563eb" />
          <Text className="text-xl font-bold text-gray-800">
            Powtarzalne
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 mb-4">
            {filters.map(filter => (
              <FilterButton
                key={filter.value}
                label={filter.label}
                value={filter.value}
                selectedValue={intervalFilter}
                onPress={setIntervalFilter}
              />
            ))}
          </View>
        </ScrollView>

        <View style={{ height: 250 }}>
          <DisplayChores
            currentScreen="chores-screen"
            typeFilter="repeatable"
            intervalFilter={intervalFilter}
          />
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="list" size={22} color="#0891b2" />
          <Text className="text-xl font-bold text-gray-800">
            Jednorazowe
          </Text>
        </View>

        <DisplayChores
          currentScreen="chores-screen"
          typeFilter="one-off"
        />
      </View>

      <TouchableOpacity
        className="absolute bottom-10 right-10 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-2xl"
        onPress={() => setIsModalVisible(true)}
        style={{ elevation: 10 }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <ChoreModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        mode="add"
        currentScreen="index"
      />
    </SafeAreaView>
  )
}