import {
  createAuthToken,
  createGuestUser,
  parseAuthToken,
  type LoginResponse,
  type User
} from '@/lib/auth';
import { checkSession, refreshToken, saveExpoToken } from '@/lib/fetch/auth';
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
  const [userLoading, setUserLoading] = useState(true);
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
    const validateAndLoadUser = async () => {
      if (isLoading) return;

      if (session) {
        setUserLoading(true);
        try {
          const tokenData = parseAuthToken(session);

          if (!tokenData || tokenData.user.guest) {
            setCurrentUser(tokenData?.user || null);
            setUserLoading(false);
            return;
          }

          const check = await checkSession(tokenData.token);

          if (check.ok) {
            if (check.shouldRefresh) {
              const refresh = await refreshToken(tokenData.token);
              if (refresh.token) {
                const newSession = createAuthToken(refresh.token, tokenData.user);
                setSession(newSession);
              }
            }
            setCurrentUser(tokenData.user);
          } else if (check.message === "Token expired") {
            const refresh = await refreshToken(tokenData.token);
            if (refresh.token) {
              const newSession = createAuthToken(refresh.token, tokenData.user);
              setSession(newSession);
              setCurrentUser(tokenData.user);
            } else {
              setSession(null);
              setCurrentUser(null);
            }
          } else {
            setSession(null);
            setCurrentUser(null);
          }
        } catch (err) {
          console.error("Session validation failed", err);
          setSession(null);
        } finally {
          setUserLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserLoading(false);
      }
    };

    validateAndLoadUser();
  }, [session, isLoading]);

  useEffect(() => {
    if (currentUser?.displayName) {
      registerForPushNotificationsAsync(currentUser.displayName).then(token => {
        if (token) {
          saveExpoToken(currentUser._id, token);
          setExpoPushToken(token);
        }
      });
      webSocketService.authenticateUser(currentUser.displayName, currentUser._id);
    } else if (!session && !isLoading && !userLoading) {
      webSocketService.clearUserData();
      webSocketService.disconnect();
    }
  }, [currentUser, isLoading, userLoading, session]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        user: currentUser,
        expoPushToken,
        isLoading: isLoading || userLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}