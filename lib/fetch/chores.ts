
import { ChoreType } from "@/app/(context)/ChoresContext";
import { getItemAsync } from "expo-secure-store";
import { parseAuthToken } from "../auth";
import { apiUrl } from "../constants";

export const getChores = async (displayName?: string | undefined): Promise<ChoreType[]> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores/${displayName}`, {
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

export const postChore = async (data: ChoreType): Promise<ChoreType | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores`, {
      method: "POST",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error: unknown) {
    console.error("Error in postChore:", error);
    return null;
  }
};