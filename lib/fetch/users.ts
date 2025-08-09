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