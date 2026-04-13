import { jwtVerify } from 'jose';
import { getUser } from './fetch/users';
import { parseAuthToken, type User } from './authUtils';

export * from './authUtils'; 

export async function getUserFromToken(tokenString: string): Promise<User | null> {
  try {
    const customToken = parseAuthToken(tokenString);
    if (customToken) {
      if (customToken.user.guest) {
        return customToken.user;
      }
      return customToken.user;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return null;
    }
    
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(tokenString, secretKey);
    
    if (payload) {
      let userId: string | null = null;
      
      if (payload._id) {
        userId = payload._id as string;
      } else if (payload.sub) {
        userId = payload.sub as string;
      } else if (payload.id) {
        userId = payload.id as string;
      }
      
      if (userId) {
        const user = await getUser(userId);
        return user;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}