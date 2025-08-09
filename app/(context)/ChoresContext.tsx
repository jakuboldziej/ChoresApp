import { parseAuthToken } from "@/lib/auth";
import { getChores } from "@/lib/fetch/chores";
import { createContext, PropsWithChildren, use, useCallback, useEffect, useReducer, useState } from "react";
import { Alert } from "react-native";
import { useSession } from "./AuthContext";

export interface ChoreType {
  _id?: string;
  ownerId: string;
  usersList: string[];
  title: string;
  description: string;
}

interface ChoreAction {
  type: 'create' | 'add-chore' | 'add-user';
  chores?: ChoreType[];
  newChore?: ChoreType;
}

interface ChoresContextTypes {
  chores: ChoreType[];
  isLoading: boolean;
  dispatchChore: React.Dispatch<ChoreAction>;
}

const ChoresContext = createContext<ChoresContextTypes>({
  chores: [],
  isLoading: false,
  dispatchChore: () => { }
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getChores(user?.displayName);

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

    fetchData();
  }, [session, user, fetchData]);

  return (
    <ChoresContext
      value={{
        chores,
        dispatchChore: dispatch,
        isLoading
      }}
    >
      {children}
    </ChoresContext>
  )
};