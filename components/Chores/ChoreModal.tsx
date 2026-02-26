import { useSession } from "@/app/(context)/AuthContext";
import { ChoreType, useChores } from "@/app/(context)/ChoresContext";
import CheckboxItem from "@/components/CheckboxItem";
import { patchChore, postChore } from "@/lib/fetch/chores";
import { validateIntervalData } from "@/lib/intervalUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IntervalSelector, { IntervalType } from "./IntervalSelector";
import UserSelector from "./UserSelector";

export interface SelectedUser {
  _id: string;
  displayName: string;
}

interface ChoreModalProps extends PropsWithChildren {
  isVisible: boolean;
  onClose: () => void;
  editChore?: ChoreType | null;
  mode?: "add" | "edit";
  currentScreen?: "index" | "chores-screen" | "chores-daily";
}

export default function ChoreModal({
  children,
  isVisible,
  onClose,
  editChore,
  mode = "add",
  currentScreen = "index"
}: ChoreModalProps) {
  const { user } = useSession();
  const { dispatchChore } = useChores();

  const [isLoading, setIsLoading] = useState(false);

  const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputRepeatable, setInputRepeatable] = useState<boolean>(false);
  const [selectedInterval, setSelectedInterval] =
    useState<IntervalType | null>(null);
  const [customDays, setCustomDays] = useState<number>(1);

  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);

  useEffect(() => {
    if (mode === "edit" && editChore) {
      setInputTitle(editChore.title);
      setInputDescription(editChore.description || "");

      setSelectedUsers(
        editChore.usersList.map((u) => ({
          _id: u.userId,
          displayName: u.displayName
        }))
      );

      setInputRepeatable(editChore.isRepeatable || false);
      setSelectedInterval(editChore.intervalType || null);
      setCustomDays(editChore.customDays || 1);
    } else if (mode === "add") {
      setInputTitle("");
      setInputDescription("");

      if (user?._id && user.displayName) {
        setSelectedUsers([
          { _id: user._id, displayName: user.displayName }
        ]);
      }

      setInputRepeatable(currentScreen === "chores-daily");
      setSelectedInterval(currentScreen === "chores-daily" ? "daily" : null);
      setCustomDays(1);
    }
  }, [mode, editChore, user?._id, user?.displayName, isVisible, currentScreen]);

  const toggleUserSelection = (userObj: SelectedUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === userObj._id);

      if (exists) {
        return prev.filter((u) => u._id !== userObj._id);
      } else {
        return [...prev, userObj];
      }
    });
  };

  const inputDescriptionRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!user?._id) {
        Alert.alert("Błąd", "Brak ID użytkownika.");
        return;
      }

      if (!inputTitle) {
        Alert.alert("Błąd", "Wypełnij pole tytuł.");
        return;
      }

      const intervalValidation = validateIntervalData({
        isRepeatable: inputRepeatable,
        intervalType: selectedInterval || undefined,
        customDays
      });

      if (!intervalValidation.isValid) {
        Alert.alert("Błąd", intervalValidation.error);
        return;
      }

      let usersList: {
        userId: string;
        displayName: string;
        finished: boolean;
      }[] = [];

      if (!inputRepeatable) {
        usersList = selectedUsers.map((u) => ({
          userId: u._id,
          displayName: u.displayName,
          finished: false
        }));
      } else {
        usersList = [
          {
            userId: user._id,
            displayName: user.displayName,
            finished: false
          }
        ];
      }

      const choreData = {
        ownerId: user._id,
        usersList,
        title: inputTitle,
        description: inputDescription,
        isRepeatable: inputRepeatable,
        ...(inputRepeatable &&
          selectedInterval && {
          intervalType: selectedInterval,
          ...(selectedInterval === "custom" && { customDays })
        })
      };

      let response;

      if (mode === "edit" && editChore?._id) {
        response = await patchChore({
          _id: editChore._id,
          ...choreData
        });

        if (response && "_id" in response) {
          dispatchChore({ type: "update", updatedChore: response });
        }
      } else {
        response = await postChore(choreData);

        if (response && "_id" in response) {
          dispatchChore({ type: "add-chore", newChore: response });
        }
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInputTitle("");
    setInputDescription("");
    setSelectedUsers([]);
    setInputRepeatable(false);
    setSelectedInterval(null);
    setCustomDays(1);
    onClose();
  };

  return (
    <View>
      {children}

      <Modal animationType="slide" transparent visible={isVisible}>
        <SafeAreaView className="flex-1">
          <View className="relative flex-1 p-6 m-8 bg-slate-300 rounded-3xl overflow-hidden">
            <TouchableOpacity
              className="absolute top-0 right-0 p-4 z-10"
              onPress={handleClose}
            >
              <Ionicons name="close-circle" size={30} />
            </TouchableOpacity>

            <View className="pt-8 gap-6">
              <Text className="text-3xl">
                {mode === "edit" ? "Edytuj obowiązek" : "Dodaj obowiązek"}
              </Text>

              <ScrollView>
                <View className="gap-4 pb-12">
                  <TextInput
                    className="w-full px-4 py-3 border bg-white rounded-lg"
                    value={inputTitle}
                    onChangeText={setInputTitle}
                  />

                  <TextInput
                    ref={inputDescriptionRef}
                    className="w-full px-4 py-3 border bg-white rounded-lg"
                    multiline
                    value={inputDescription}
                    onChangeText={setInputDescription}
                  />

                  <CheckboxItem
                    label="Powtarzalne?"
                    isSelected={inputRepeatable}
                    onPress={() => setInputRepeatable(prev => !prev)}
                    checkboxClassName={!inputRepeatable ? 'border-black' : ''}
                  />

                  {!inputRepeatable ? (
                    <UserSelector
                      selectedUsers={selectedUsers}
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
                    className="self-end p-3 rounded-lg mt-6 bg-blue-600"
                    onPress={handleSubmit}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-lg">
                        {mode === "edit" ? "Zapisz" : "Dodaj"}
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
  );
}