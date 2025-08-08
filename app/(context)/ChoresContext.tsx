import { parseAuthToken } from "@/lib/auth";
import { getChores } from "@/lib/fetch/chores";
import { createContext, PropsWithChildren, use, useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSession } from "./AuthContext";

export interface ChoreType {
  _id: string;
}

interface ChoresContextTypes {
  chores: ChoreType[];
  isLoading: boolean;
}

const ChoresContext = createContext<ChoresContextTypes>({
  chores: [],
  isLoading: false
});

export function useChores() {
  const value = use(ChoresContext);

  if (!value) throw new Error('useChores must be wrapped in a <ChoresProvider />');

  return value
};

export function ChoresProvider({ children }: PropsWithChildren) {
  const { session, user } = useSession();

  const [chores, setChores] = useState<ChoreType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getChores(user?.displayName);

      console.log(response);

      setChores(response);
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
        isLoading
      }}
    >
      {children}
    </ChoresContext>
  )
};