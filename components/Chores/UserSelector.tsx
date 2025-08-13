import { useSession } from '@/app/(context)/AuthContext';
import { useFriends } from '@/app/(context)/FriendsContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface UserOption {
  label: string;
  value: string;
}

interface UserSelectorProps {
  selectedUserNames: string[];
  onToggleUser: (userName: string) => void;
}

export default function UserSelector({ selectedUserNames, onToggleUser }: UserSelectorProps) {
  const { user } = useSession();
  const { friends } = useFriends();

  const getAvailableUsers = (): UserOption[] => {
    const users: UserOption[] = [{ label: user?.displayName || 'Ja', value: user?._id || '' }];

    if (friends && Array.isArray(friends)) {
      friends.forEach((friendDisplayName: string) => {
        users.push({
          label: friendDisplayName,
          value: friendDisplayName
        });
      });
    }

    return users.filter((user, index, self) =>
      user.value &&
      user.value !== '' &&
      self.findIndex(u => u.value === user.value) === index
    );
  };

  const availableUsers = getAvailableUsers();

  return (
    <View>
      <Text className="text font-medium text-gray-700 mb-2">Przypisz użytkowników</Text>

      <View className="bg-white border border-gray-300 rounded-lg">
        <ScrollView
          style={{ maxHeight: 200 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ padding: 8 }}
        >
          {availableUsers.map((userOption) => (
            <TouchableOpacity
              key={userOption.value}
              onPress={() => onToggleUser(userOption.label)}
              className="flex-row items-center py-2 px-2 active:bg-gray-100"
            >
              <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${selectedUserNames.includes(userOption.label)
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300'
                }`}>
                {selectedUserNames.includes(userOption.label) && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-gray-900 flex-1" numberOfLines={1}>
                {userOption.label}
              </Text>
            </TouchableOpacity>
          ))}

          {availableUsers.length === 0 && (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Brak dostępnych użytkowników</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Text className="text-xs text-gray-500 mt-1">
        Wybrano: {selectedUserNames.length} użytkowników
        {availableUsers.length > 0 && ` z ${availableUsers.length} dostępnych`}
      </Text>
    </View>
  );
}
