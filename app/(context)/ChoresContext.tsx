import { parseAuthToken } from "@/lib/auth";
import { getChores, patchChore } from "@/lib/fetch/chores";
import { createContext, PropsWithChildren, use, useCallback, useEffect, useReducer, useState } from "react";
import { Alert } from "react-native";
import { useSession } from "./AuthContext";

export interface ChoreType {
  _id?: string;
  ownerId: string;
  usersList: string[];
  title: string;
  description: string;
  finished?: boolean;
}

export interface ChoreTypeFilters {
  finished?: boolean;
  userId?: string;
}

interface ChoreAction {
  type: 'create' | 'update' | 'add-chore' | 'add-user';
  chores?: ChoreType[];
  newChore?: ChoreType;
  updatedChore?: ChoreType;
}

interface ChoresContextTypes {
  chores: ChoreType[];
  isLoading: boolean;
  dispatchChore: React.Dispatch<ChoreAction>;
  fetchData: (filters?: ChoreTypeFilters) => Promise<void>;
  handleChoreFinished: (choreId: string, choreFinished: boolean) => Promise<void>;
}

const ChoresContext = createContext<ChoresContextTypes>({
  chores: [],
  isLoading: false,
  dispatchChore: () => { },
  fetchData: async () => { },
  handleChoreFinished: async () => { }
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

  const handleChoreFinished = async (choreId: string, choreFinished: boolean) => {
    if (!choreId) {
      Alert.alert("Błąd", "Nie znaleziono obowiązku do oznaczenia jako wykonane.");
      return;
    }

    try {
      if (!choreId) throw new Error("Brak identyfikatora obowiązku.");
      const response = await patchChore({
        _id: choreId,
        finished: !choreFinished
      });

      if (!response) {
        Alert.alert("Błąd", "Nie udało się zaktualizować obowiązku.");
        return;
      }

      if ('message' in response) {
        Alert.alert("Błąd", response.message);
        return;
      }

      dispatch({ type: "update", updatedChore: response });
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        Alert.alert("Błąd", error.message);
      }
    }
  }

  const fetchData = useCallback(async (filters?: ChoreTypeFilters) => {
    setIsLoading(true);

    try {
      if (!user?._id) throw new Error("User is required");

      const response = await getChores({
        userId: user._id,
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
  }, [user?._id]);

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
        handleChoreFinished
      }}
    >
      {children}
    </ChoresContext>
  )
};