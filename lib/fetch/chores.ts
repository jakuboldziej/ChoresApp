
import { ChoreType, ChoreTypeFilters } from "@/app/(context)/ChoresContext";
import { getItemAsync } from "expo-secure-store";
import { parseAuthToken } from "../auth";
import { apiUrl } from "../constants";

export const getChores = async (filters: ChoreTypeFilters): Promise<ChoreType[]> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    let url = `${apiUrl}/chores`;
    
    const queryParams = new URLSearchParams();
    
    if (filters.finished !== undefined) {
      queryParams.append('finished', filters.finished.toString());
    }
    
    if (filters.userInvolved) {
      queryParams.append('userInvolved', filters.userInvolved);
    }

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }

    const response = await fetch(url, {
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

export const getChore = async (choreId: string): Promise<ChoreType | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores/${choreId}`, {
      method: "GET",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : ""
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("Error in getChore:", error);
    return null;
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

export const patchChore = async (data: Partial<ChoreType> & { _id: string }): Promise<ChoreType | { message: string } | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores/${data._id}`, {
      method: "PATCH",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return result;
    }
    
    return result;
  } catch (error: unknown) {
    console.error("Error in patchChore:", error);
    return null;
  }
};

export const deleteChore = async (choreId: string): Promise<ChoreType | { message: string } | null> => {
  const sessionString = await getItemAsync("session");
  const session = sessionString ? parseAuthToken(sessionString) : null;

  try {
    const response = await fetch(`${apiUrl}/chores/${choreId}`, {
      method: "DELETE",
      headers: {
        "Authorization": session && typeof session.token === "string" ? session.token : "",
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return result;
    }
    
    return result;
  } catch (error: unknown) {
    console.error("Error in deleteChore:", error);
    return null;
  }
};