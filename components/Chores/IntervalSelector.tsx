import CheckboxItem from '@/components/CheckboxItem';
import NumberInput from '@/components/NumberInput';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export type IntervalType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface IntervalOption {
  type: IntervalType;
  label: string;
}

interface IntervalSelectorProps {
  selectedInterval: IntervalType | null;
  onSelectInterval: (interval: IntervalType) => void;
  customDays?: number;
  onCustomDaysChange?: (days: number) => void;
}

const intervalOptions: IntervalOption[] = [
  {
    type: 'daily',
    label: 'Codziennie',
  },
  {
    type: 'weekly',
    label: 'Co tydzień',
  },
  {
    type: 'monthly',
    label: 'Co miesiąc',
  },
  {
    type: 'custom',
    label: 'Niestandardowy',
  }
];

export default function IntervalSelector({
  selectedInterval,
  onSelectInterval,
  customDays = 1,
  onCustomDaysChange
}: IntervalSelectorProps) {
  return (
    <View>
      <Text className="text font-medium text-gray-700 mb-2">Wybierz interwał powtarzania</Text>

      <View className="bg-white border border-gray-300 rounded-lg">
        <ScrollView
          style={{ maxHeight: 250 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ padding: 8 }}
        >
          {intervalOptions.map((option) => (
            <View key={option.type}>
              <CheckboxItem
                label={option.label}
                isSelected={selectedInterval === option.type}
                onPress={() => onSelectInterval(option.type)}
              />

              {selectedInterval === option.type && (
                <View className="ml-8 mr-2">
                  {option.type === 'custom' && onCustomDaysChange && (
                    <View className="mt-2">
                      <NumberInput
                        value={customDays}
                        onValueChange={onCustomDaysChange}
                        label="Co"
                        min={1}
                        max={365}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {selectedInterval && (
        <Text className="text-xs text-gray-500 mt-1">
          Wybrano: {intervalOptions.find(opt => opt.type === selectedInterval)?.label}
        </Text>
      )}
    </View>
  );
}