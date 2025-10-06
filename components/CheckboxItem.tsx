import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CheckboxItemProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  containerClassName?: string;
  textClassName?: string;
  checkboxClassName?: string;
}

export default function CheckboxItem({
  label,
  isSelected,
  onPress,
  containerClassName = '',
  textClassName = '',
  checkboxClassName = ''
}: CheckboxItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center py-2 px-2 active:bg-gray-100 ${containerClassName}`}
    >
      <View
        className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${isSelected
          ? 'bg-blue-500 border-blue-500'
          : 'border-gray-300'
          } ${checkboxClassName}`}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={14} color="white" />
        )}
      </View>
      <Text className={`text-gray-900 flex-1 ${textClassName}`} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}