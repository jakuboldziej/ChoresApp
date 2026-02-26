import { useSession } from '@/app/(context)/AuthContext';
import { useFriends } from '@/app/(context)/FriendsContext';
import CheckboxItem from '@/components/CheckboxItem';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SelectedUser } from './ChoreModal';

interface UserSelectorProps { selectedUsers: SelectedUser[]; onToggleUser: (user: SelectedUser) => void; }

export default function UserSelector({ selectedUsers, onToggleUser }: UserSelectorProps) {
  const { user } = useSession();
  const { friends } = useFriends();

  const getAvailableUsers = (): SelectedUser[] => {
    const users: SelectedUser[] = [];

    if (user?._id && user.displayName) {
      users.push({
        _id: user._id,
        displayName: user.displayName
      });
    }

    if (friends && Array.isArray(friends)) {
      friends.forEach((friendName: string) => {
        users.push({
          _id: friendName,
          displayName: friendName
        });
      });
    }

    return users.filter(
      (u, i, self) => u._id && self.findIndex(x => x._id === u._id) === i
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
          {availableUsers.map((u) => (
            <CheckboxItem key={u._id} label={u.displayName} isSelected={selectedUsers.some(su => su._id === u._id)}
              onPress={() => onToggleUser(u)}
            />
          ))}

          {availableUsers.length === 0 && (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Brak dostępnych użytkowników</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Text className="text-xs text-gray-500 mt-1">
        Wybrano: {selectedUsers.length} użytkowników
        {availableUsers.length > 0 && ` z ${availableUsers.length} dostępnych`}
      </Text>
    </View>
  );
}
