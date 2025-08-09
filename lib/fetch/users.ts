import { getItemAsync } from "expo-secure-store";
import { parseAuthToken } from "../auth";
import { apiUrl } from "../constants";

export const getUser = async (displayName: string) => {
  try {
    const response = await fetch(`${apiUrl}/auth/users/${displayName}`);

    return await response.json();
  } catch (error: unknown) {
    console.error('getUser error details:', error);
    return false;
  }
}

export const addFriend = async (friendsCode: string) => {
  try {
    const sessionString = await getItemAsync("session");
    const session = sessionString ? parseAuthToken(sessionString) : null;

    const response = await fetch(`${apiUrl}/auth/users/send-friends-request/`, {
      method: "POST",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userFriendCode: friendsCode
      })
    });

    return await response.json();
  } catch (error: unknown) {
    console.error('getUser error details:', error);
    return false;
  }
}