import { ChoresUserType } from "@/app/(context)/ChoresContext";
import { getItemAsync } from "expo-secure-store";
import { parseAuthToken } from "../auth";
import { apiUrl } from "../constants";

export const getChoresUser = async (
  choresUserAuthUserId: string,
): Promise<ChoresUserType | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(
      `${apiUrl}/choresUsers/${choresUserAuthUserId}`,
      {
        method: "GET",
        headers: {
          Authorization:
            session && typeof session.token === "string" ? session.token : "",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("Error in getChore:", error);
    return null;
  }
};
