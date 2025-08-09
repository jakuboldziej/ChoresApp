import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddFriends() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputFriendsCode, setInputFriendsCode] = useState("");

  const handleAddFriend = async () => {
    setIsLoading(true);
    try {

    } catch (error) {
      if (error instanceof TypeError) {
        Alert.alert("Błąd", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='w-screen self-start p-4 gap-4'>
      <Text className="text-3xl font-bold text-left">Dodaj znajomego</Text>

      <View className='w-full flex-row justify-between items-end gap-2'>
        <TextInput
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Kod znajomego"
          value={inputFriendsCode}
          onChangeText={setInputFriendsCode}
        />

        <TouchableOpacity
          className={`px-4 py-3 rounded-lg ${isLoading === true || !inputFriendsCode ? "bg-blue-600/30" : "bg-blue-600"}`}
          onPress={handleAddFriend}
          disabled={isLoading || !inputFriendsCode}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Dodaj</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
