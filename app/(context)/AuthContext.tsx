import {
  createAuthToken,
  createGuestUser,
  getUserFromToken,
  type LoginResponse,
  type User
} from '@/lib/auth';
import { saveExpoToken } from '@/lib/fetch/auth';
import { useStorageState } from '@/lib/hooks/useStorageState';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { webSocketService } from '@/lib/websocket/WebSocketService';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

interface AuthContextType {
  signIn: (asGuest: boolean, response?: LoginResponse | undefined) => Promise<void>;
  signOut: () => Promise<void>;
  session?: string | null;
  user?: User | null;
  expoPushToken?: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => { },
  signOut: async () => { },
  session: null,
  user: null,
  expoPushToken: null,
  isLoading: false,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) throw new Error('useSession must be wrapped in a <SessionProvider />');

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const signIn = async (asGuest: boolean, response?: LoginResponse | undefined) => {
    try {
      if (asGuest) {
        const guestUser = createGuestUser();

        const guestToken = createAuthToken('guest-token', guestUser);
        setSession(guestToken);
        setCurrentUser(guestUser);
      } else {
        if (!response) throw new Error('Login response is undefined');
        const authTokenString = createAuthToken(response.token, response.user);
        setSession(authTokenString);
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      webSocketService.resetConnection();

      setSession(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (session) {
        setUserLoading(true);
        try {
          const user = await getUserFromToken(session);
          setCurrentUser(user);

          if (!user) {
            setSession(null);
          }
        } catch {
          setSession(null);
          setCurrentUser(null);
        } finally {
          setUserLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserLoading(false);
      }
    };

    loadUser();
  }, [session, setSession]);

  useEffect(() => {
    const setupPushNotifications = async () => {
      if (currentUser?.displayName) {
        try {
          const token = await registerForPushNotificationsAsync(currentUser.displayName);
          if (token) {
            await saveExpoToken(currentUser._id, token);
            setExpoPushToken(token);
          }
        } catch (error) {
          console.error('Failed to register for push notifications:', error);
        }
      } else {
        setExpoPushToken(null);
      }
    };

    const setupWebSocketConnection = () => {
      if (currentUser?.displayName && currentUser?._id) {
        webSocketService.authenticateUser(currentUser.displayName, currentUser._id);
      } else if (!session && !isLoading && !userLoading) {
        webSocketService.clearUserData();
        webSocketService.disconnect();
      }
    };

    setupPushNotifications();
    setupWebSocketConnection();
  }, [currentUser, isLoading, userLoading, session]);

  return (
    <AuthContext
      value={{
        signIn,
        signOut,
        session,
        user: currentUser,
        expoPushToken,
        isLoading: isLoading || userLoading,
      }}>
      {children}
    </AuthContext>
  );
}
