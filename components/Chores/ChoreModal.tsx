import { useSession } from "@/app/(context)/AuthContext";
import { ChoreType, useChores } from "@/app/(context)/ChoresContext";
import CheckboxItem from "@/components/CheckboxItem";
import { patchChore, postChore } from "@/lib/fetch/chores";
import { calculateNextDueDate, validateIntervalData } from "@/lib/intervalUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IntervalSelector, { IntervalType } from "./IntervalSelector";
import UserSelector from "./UserSelector";

interface ChoreModalProps extends PropsWithChildren {
  isVisible: boolean;
  onClose: () => void;
  editChore?: ChoreType | null;
  mode?: 'add' | 'edit';
}

export default function ChoreModal({ children, isVisible, onClose, editChore, mode = 'add' }: ChoreModalProps) {
  const { user } = useSession();
  const { dispatchChore } = useChores();

  const [isLoading, setIsLoading] = useState(false);

  const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputRepeatable, setInputRepeatable] = useState<boolean>(false);
  const [selectedInterval, setSelectedInterval] = useState<IntervalType | null>(null);
  const [customDays, setCustomDays] = useState<number>(1);
  const [selectedUserNames, setSelectedUserNames] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && editChore) {
      setInputTitle(editChore.title);
      setInputDescription(editChore.description || "");
      setSelectedUserNames(editChore.usersList.map(user => user.displayName));

      setInputRepeatable(editChore.isRepeatable || false);
      setSelectedInterval(editChore.intervalType || null);
      setCustomDays(editChore.customDays || 1);
    } else {
      setInputTitle("");
      setInputDescription("");
      setSelectedUserNames(user?.displayName ? [user.displayName] : []);
      setInputRepeatable(false);
      setSelectedInterval(null);
      setCustomDays(1);
    }
  }, [mode, editChore, user?.displayName, isVisible]);

  const toggleUserSelection = (userName: string) => {
    setSelectedUserNames(prev => {
      if (prev.includes(userName)) {
        return prev.filter(name => name !== userName);
      } else {
        return [...prev, userName];
      }
    });
  };

  const inputDescriptionRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!user?._id) {
        Alert.alert("Błąd", "Brak ID użytkownika. Nie można zapisać obowiązku.");
        return;
      }

      if (!inputTitle) {
        Alert.alert("Błąd", "Wypełnij pole tytuł.");
        return;
      }

      if (selectedUserNames.length === 0) {
        Alert.alert("Błąd", "Przypisz przynajmniej jednego użytkownika.");
        return;
      }

      const intervalValidation = validateIntervalData({
        isRepeatable: inputRepeatable,
        intervalType: selectedInterval || undefined,
        customDays: customDays
      });

      if (!intervalValidation.isValid) {
        Alert.alert("Błąd", intervalValidation.error);
        return;
      }

      const nextDueDate = inputRepeatable && selectedInterval
        ? calculateNextDueDate(selectedInterval, customDays)
        : undefined;

      const choreData = {
        ownerId: user._id,
        usersList: selectedUserNames.map(name => ({ displayName: name, finished: false })),
        title: inputTitle,
        description: inputDescription,
        isRepeatable: inputRepeatable,
        ...(inputRepeatable && selectedInterval && {
          intervalType: selectedInterval,
          ...(selectedInterval === 'custom' && { customDays }),
          nextDueDate: nextDueDate?.toISOString()
        })
      };

      let response;

      if (mode === 'edit' && editChore?._id) {
        response = await patchChore({
          _id: editChore._id,
          ...choreData
        });

        if (!response || (typeof response === "object" && "message" in response)) {
          throw new Error((response as { message?: string }).message || "Błąd w aktualizacji obowiązku");
        }

        dispatchChore({ type: "update", updatedChore: response as ChoreType });
      } else {
        response = await postChore(choreData);

        if (!response || (typeof response === "object" && "message" in response && typeof response.message === "string")) {
          throw new Error((response as { message?: string }).message || "Błąd w tworzeniu obowiązku");
        }

        dispatchChore({ type: "add-chore", newChore: response });
      }

      setInputTitle("");
      setInputDescription("");
      setSelectedUserNames([]);
      setInputRepeatable(false);
      setSelectedInterval(null);
      setCustomDays(1);
      onClose();
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        Alert.alert(`Błąd przy ${mode === 'edit' ? 'aktualizacji' : 'dodawaniu'} obowiązku`, error.message)
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInputTitle("");
    setInputDescription("");
    setSelectedUserNames([]);
    setInputRepeatable(false);
    setSelectedInterval(null);
    setCustomDays(1);
    onClose();
  };

  return (
    <View>
      {children}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={handleClose}
      >
        <SafeAreaView className="flex-1">
          <View className="relative flex-1 p-6 m-8 bg-slate-300 rounded-3xl overflow-hidden">
            <TouchableOpacity
              className="absolute top-0 right-0 p-4 z-10"
              onPress={handleClose}>
              <Ionicons name="close-circle" size={30} />
            </TouchableOpacity>

            <View className="pt-8 gap-6">
              <Text className="text-3xl">
                {mode === 'edit' ? 'Edytuj obowiązek' : 'Dodaj obowiązek'}
              </Text>

              <ScrollView>
                <View className="gap-4 pb-12">
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

                  <CheckboxItem
                    label="Powtarzalne?"
                    isSelected={inputRepeatable}
                    onPress={() => setInputRepeatable(prev => !prev)}
                    checkboxClassName={!inputRepeatable ? 'border-black' : ''}
                  />

                  {!inputRepeatable ? (
                    <UserSelector
                      selectedUserNames={selectedUserNames}
                      onToggleUser={toggleUserSelection}
                    />
                  ) : (
                    <IntervalSelector
                      selectedInterval={selectedInterval}
                      onSelectInterval={setSelectedInterval}
                      customDays={customDays}
                      onCustomDaysChange={setCustomDays}
                    />
                  )}

                  <TouchableOpacity
                    className={`self-end w-fit p-3 rounded-lg mt-6 ${isLoading === true ? "bg-blue-600/30" : "bg-blue-600"}`}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-semibold text-lg">
                        {mode === 'edit' ? 'Zapisz' : 'Dodaj'}
                      </Text>
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