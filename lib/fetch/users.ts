// lib/fetch/users.ts
import { getItemAsync } from "expo-secure-store";
import { apiUrl } from "../constants";

import { parseAuthToken, type User } from "../authUtils";

export const getUser = async (displayName: string): Promise<User | null> => {
  try {
    const response = await fetch(`${apiUrl}/auth/users/${displayName}`);

    return await response.json();
  } catch (error: unknown) {
    console.error("getUser error details:", error);
    return null;
  }
};

export const addFriend = async (friendsCode: string) => {
  try {
    const sessionString = await getItemAsync("session");
    const session = sessionString ? parseAuthToken(sessionString) : null;

    const response = await fetch(`${apiUrl}/auth/users/send-friends-request/`, {
      method: "POST",
      headers: {
        Authorization:
          session && typeof session.token === "string"
            ? `Bearer ${session.token}`
            : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userFriendCode: friendsCode,
      }),
    });

    return await response.json();
  } catch (error: unknown) {
    console.error("getUser error details:", error);
    return false;
  }
};
