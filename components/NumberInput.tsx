import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  suffix?: string;
}

export default function NumberInput({
  value,
  onValueChange,
  min = 1,
  max = 365,
  label,
  suffix
}: NumberInputProps) {
  const increment = () => {
    if (value < max) {
      onValueChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const getSuffix = (num: number) => {
    if (suffix) return suffix;
    if (num === 1) return 'dzień';
    if (num < 5) return 'dni';
    return 'dni';
  };

  return (
    <View className="flex-row items-center">
      {label && (
        <Text className="text-sm text-gray-700 mr-2">{label}</Text>
      )}

      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg">
        <TouchableOpacity
          onPress={decrement}
          disabled={value <= min}
          className={`p-2 ${value <= min ? 'opacity-50' : 'active:bg-gray-100'}`}
        >
          <Ionicons name="remove" size={16} color={value <= min ? '#9CA3AF' : '#374151'} />
        </TouchableOpacity>

        <View className="px-3 py-2 min-w-[50px] items-center">
          <Text className="text-base font-medium text-gray-900">{value}</Text>
        </View>

        <TouchableOpacity
          onPress={increment}
          disabled={value >= max}
          className={`p-2 ${value >= max ? 'opacity-50' : 'active:bg-gray-100'}`}
        >
          <Ionicons name="add" size={16} color={value >= max ? '#9CA3AF' : '#374151'} />
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-gray-700 ml-2">
        {getSuffix(value)}
      </Text>
    </View>
  );
}