import { useSession } from "@/app/(context)/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddChore() {
  const { session, user } = useSession();
  const [modalVisible, setModalVisible] = useState(false);

  const inputDescriptionRef = useRef<TextInput>(null);

  const handleAddChore = async () => {
    try {
      // const response = await postChore({});
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        Alert.alert("Błąd przy dodawaniu obowiązku", error.message)
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        className="w-full bg-blue-600 p-3 rounded-lg mt-6"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-center font-semibold text-lg">Dodaj obowiązek</Text>
      </TouchableOpacity>

      <SafeAreaView className="flex-1">
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View className="relative flex-1 p-6 m-8 bg-slate-300 rounded-3xl overflow-hidden">
            <TouchableOpacity
              className="absolute top-0 right-0 p-4 z-10"
              onPress={() => setModalVisible(!modalVisible)}>
              <Ionicons name="close-circle" size={30} />
            </TouchableOpacity>

            <View className="pt-8 gap-6">
              <Text className="text-3xl">Dodaj obowiązek</Text>

              <ScrollView>
                <View className="gap-4">
                  <View>
                    <Text className="text font-medium text-gray-700 mb-2">Tytuł</Text>
                    <TextInput
                      className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg"
                      // value={displayName}
                      // onChangeText={setDisplayName}
                      returnKeyType="next"
                      onSubmitEditing={() => inputDescriptionRef.current?.focus()}
                    />
                  </View>
                  <View>
                    <Text className="text font-medium text-gray-700 mb-2">Opis</Text>
                    <TextInput
                      ref={inputDescriptionRef}
                      className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg"
                      multiline
                      // value={displayName}
                      // onChangeText={setDisplayName}
                      returnKeyType="next"
                    />
                  </View>

                  <TouchableOpacity
                    className="self-end w-fit bg-blue-600 p-3 rounded-lg mt-6"
                    onPress={handleAddChore}
                  // disabled={isLoading}
                  >
                    <Text className="text-white text-center font-semibold text-lg">Dodaj</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}