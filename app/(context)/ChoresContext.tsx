import { parseAuthToken } from "@/lib/auth";
import { findChoreUser } from "@/lib/choreUtils";
import { deleteChore, getChores, patchChore } from "@/lib/fetch/chores";
import { router } from "expo-router";
import { createContext, PropsWithChildren, use, useCallback, useEffect, useReducer, useState } from "react";
import { Alert } from "react-native";
import { useSession } from "./AuthContext";

export interface ChoreType {
  _id?: string;
  ownerId: string;
  usersList: { displayName: string; finished: boolean }[];
  title: string;
  description: string;
  finished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Interval/repeatable properties
  isRepeatable?: boolean;
  intervalType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  nextDueDate?: string;
  lastCompletedDate?: string;
}

export interface ChoreTypeFilters {
  finished?: boolean;
  userId?: string;
  userInvolved?: string;
  assignedTo?: string;
}

interface ChoreAction {
  type: 'create' | 'update' | 'delete' | 'add-chore' | 'add-user';
  chores?: ChoreType[];
  newChore?: ChoreType;
  updatedChore?: ChoreType;
  deletedChoreId?: string;
}

interface ChoresContextTypes {
  chores: ChoreType[];
  isLoading: boolean;
  dispatchChore: React.Dispatch<ChoreAction>;
  fetchData: (filters?: ChoreTypeFilters) => Promise<void>;
  handleChoreFinished: (choreId: string, userDisplayName: string) => Promise<void>;
  handleChoreDelete: (choreId: string, redirect: boolean) => Promise<void>;
}

const ChoresContext = createContext<ChoresContextTypes>({
  chores: [],
  isLoading: false,
  dispatchChore: () => { },
  fetchData: async () => { },
  handleChoreFinished: async () => { },
  handleChoreDelete: async () => { }
});

export function useChores() {
  const value = use(ChoresContext);

  if (!value) throw new Error('useChores must be wrapped in a <ChoresProvider />');

  return value
};

export function ChoresProvider({ children }: PropsWithChildren) {
  const { session, user } = useSession();

  const choresReducer = (state: ChoreType[], action: ChoreAction): ChoreType[] => {
    switch (action.type) {
      case 'create':
        return action.chores || [];
      case 'update':
        if (!action.updatedChore) return state;
        return state.map(chore =>
          chore._id === action.updatedChore!._id ? action.updatedChore! : chore
        );
      case 'delete':
        return state.filter((chore) => chore._id !== action.deletedChoreId)
      case 'add-chore':
        return action.newChore ? [action.newChore, ...state] : state;
      case 'add-user':
        return state;
      default:
        return state;
    }
  }

  const [chores, dispatch] = useReducer(choresReducer, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleChoreFinished = async (choreId: string, userDisplayName: string) => {
    if (!choreId) {
      Alert.alert("Błąd", "Nie znaleziono obowiązku do oznaczenia jako wykonane.");
      return;
    }

    try {
      if (!choreId) throw new Error("Brak identyfikatora obowiązku.");

      const foundChore = chores.find((chore) => chore._id === choreId);

      if (!foundChore) throw new Error("Nie znaleziono obowiązku.");

      const foundChoreUser = findChoreUser(foundChore, userDisplayName);

      if (!foundChoreUser) throw new Error("Nie znaleziono użytkownika obowiązku.");

      const updatedUsersList = foundChore.usersList.map((choreUser) => {
        if (choreUser.displayName === foundChoreUser.displayName) {
          choreUser.finished = !choreUser.finished;
        }

        return choreUser;
      });

      const response = await patchChore({
        _id: choreId,
        usersList: updatedUsersList
      });

      if (!response) {
        Alert.alert("Błąd", "Nie udało się zaktualizować obowiązku.");
        return;
      }

      if ('message' in response) {
        Alert.alert("Błąd", response.message);
        return;
      }

      console.log(response)

      dispatch({ type: "update", updatedChore: response });
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        Alert.alert("Błąd", error.message);
      }
    }
  };

  const handleChoreDelete = async (choreId: string, redirect: boolean): Promise<void> => {
    if (!choreId) {
      Alert.alert("Błąd", "Nie znaleziono obowiązku do usunięcia.");
      return;
    }

    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć to zadanie? Ta operacja nie może być cofnięta.",
      [
        {
          text: "Anuluj",
          style: "cancel"
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              if (!choreId) throw new Error("Brak identyfikatora obowiązku.");
              const response = await deleteChore(choreId);

              if (!response) {
                Alert.alert("Błąd", "Nie udało się usunąć obowiązku.");
                return;
              }

              if ('message' in response) {
                Alert.alert("Błąd", response.message);
                return;
              }

              dispatch({ type: "delete", deletedChoreId: choreId });
              if (redirect) router.back();
              return;
            } catch (error) {
              console.error(error);
              if (error instanceof TypeError) {
                Alert.alert("Błąd", error.message);
              }
            }
          }
        }
      ]
    );
  }

  const fetchData = useCallback(async (filters?: ChoreTypeFilters) => {
    setIsLoading(true);

    try {
      if (!user?.displayName) throw new Error("Użytkownik jest wymagany");

      const response = await getChores({
        userInvolved: user.displayName,
        ...(filters || {})
      });

      dispatch({ type: "create", chores: response });
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        Alert.alert(error.message);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.displayName]);

  useEffect(() => {
    if (!session || !user) return;

    if (user.guest === true) return;

    const authToken = parseAuthToken(session);
    if (!authToken) return;

    fetchData({
      userId: user._id
    });
  }, [session, user, fetchData]);

  return (
    <ChoresContext
      value={{
        chores,
        dispatchChore: dispatch,
        isLoading,
        fetchData,
        handleChoreFinished,
        handleChoreDelete
      }}
    >
      {children}
    </ChoresContext>
  )
};