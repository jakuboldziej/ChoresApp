import { getItemAsync } from "expo-secure-store";
import { Alert } from "react-native";
import { LoginResponse, parseAuthToken, User } from "../auth";
import { apiUrl } from "../constants";
import { getUser } from "./users";

export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export const login = async (displayName: string, password: string) => {
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        displayName,
        password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Błąd autoryzacji'}`);
    }

    const data = await response.json();
    
    if (!data?.token || !data) throw new Error(data?.message || 'Błąd autoryzacji');

    const userResponse = await getUser(displayName);

    if (!userResponse) throw new Error("Błąd autoryzacji");
    if (userResponse && (userResponse as any).message) throw new Error((userResponse as any).message);
    
    return {
      ...data,
      user: userResponse as User
    } as LoginResponse;
  } catch (error: unknown) {    
    if (error instanceof TypeError && error.message === 'Network request failed') {
      Alert.alert(
        "Błąd połączenia z serwerem", 
        `Nie udało się połączyć z serwerem ${apiUrl}.`,
        [
          { text: "Zamknij", style: "cancel", onPress: () => { throw error; } },
        ]
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      const unknownError = new Error("Nieoczekiwany błąd przy logowaniu.");
      Alert.alert("Błąd autoryzacji", unknownError.message);
      throw unknownError;
    }
  }
};

export const saveExpoToken = async (userId: string, pushToken: string) => {
    const sessionString = await getItemAsync("session");
    const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores/users/save-expo-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": session && typeof session.token === "string" ? session.token : "",
      },
      body: JSON.stringify({
        userId,
        pushToken
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Saving token failed:', error);
    return;
  }
}