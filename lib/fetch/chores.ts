
import { ChoreType } from "@/app/(context)/ChoresContext";
import { getItemAsync } from "expo-secure-store";
import { parseAuthToken } from "../auth";
import { apiUrl } from "../variables";

interface PostChoreType {
  chore: ChoreType;

}

export const getChores = async (displayName?: string | undefined): Promise<ChoreType[]> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chore/chores/${displayName}`, {
      method: "GET",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : ""
      }
    });

    return await response.json();
  } catch (error: unknown) {
    console.error(error);
    return [];
  }
};

export const postChore = async (data: PostChoreType): Promise<ChoreType | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chore/chores`, {
      method: "POST",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : ""
      },
      body: JSON.stringify(data)
    });

    return await response.json();
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
};