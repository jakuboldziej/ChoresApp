import React from "react";
import { Text, TouchableOpacity } from "react-native";

export type IntervalFilter = "all" | "daily" | "weekly" | "monthly" | "custom";

interface FilterButtonProps {
  label: string;
  value: IntervalFilter;
  selectedValue: IntervalFilter;
  onPress: (value: IntervalFilter) => void;
}

export default function FilterButton({
  label,
  value,
  selectedValue,
  onPress
}: FilterButtonProps) {
  const isActive = selectedValue === value;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className={`px-3 py-2 rounded-lg ${isActive ? "bg-blue-500" : "bg-gray-200"}`}
    >
      <Text className={`${isActive ? "text-white" : "text-gray-700"} font-semibold`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}