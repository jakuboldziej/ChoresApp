import { useSession } from "@/app/(context)/AuthContext";
import { useChores } from "@/app/(context)/ChoresContext";
import { postChore } from "@/lib/fetch/chores";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddChore() {
  const { user } = useSession();
  const { dispatchChore } = useChores();

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");

  const inputDescriptionRef = useRef<TextInput>(null);

  const handleAddChore = async () => {
    setIsLoading(true);

    try {
      if (!user?._id) {
        Alert.alert("Błąd", "Brak ID użytkownika. Nie można dodać obowiązku.");
        return;
      }

      if (!inputTitle || !inputDescription) {
        Alert.alert("Błąd", "Wypełnij wszystkie pola.");
        return;
      }

      const response = await postChore({
        ownerId: user._id,
        usersList: [user._id],
        title: inputTitle,
        description: inputDescription
      });

      if (!response) throw new Error("Błąd w tworzeniu obowiązku");

      dispatchChore({ type: "add-chore", newChore: response });
      setModalVisible(true);
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        Alert.alert("Błąd przy dodawaniu obowiązku", error.message)
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        className="self-center bg-blue-600 p-3 rounded-lg mt-4"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-center font-semibold text-lg">Dodaj obowiązek</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <SafeAreaView className="flex-1">
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
                      value={inputTitle}
                      onChangeText={setInputTitle}
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
                      value={inputDescription}
                      onChangeText={setInputDescription}
                      returnKeyType="next"
                    />
                  </View>

                  <TouchableOpacity
                    className={`self-end w-fit p-3 rounded-lg mt-6 ${isLoading === true ? "bg-blue-600/30" : "bg-blue-600"}`}
                    onPress={handleAddChore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-semibold text-lg">Dodaj</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}