import {
  createAuthToken,
  createGuestUser,
  parseAuthToken,
  shouldRefreshToken,
  type LoginResponse,
  type User
} from '@/lib/auth';
import { checkSession, refreshToken, saveExpoToken } from '@/lib/fetch/auth';
import { useStorageState } from '@/lib/hooks/useStorageState';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { webSocketService } from '@/lib/websocket/WebSocketService';
import { createContext, use, useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

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

const isAuthRejection = (status: number) => status === 401 || status === 403;

const REVALIDATE_INTERVAL_MS = 60 * 60 * 1000;

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const sessionRef = useRef<string | null>(null);
  const validatedTokenRef = useRef<string | null>(null);
  const isValidatingRef = useRef(false);
  const lastValidatedAtRef = useRef(0);
  const registeredPushForRef = useRef<string | null>(null);

  useEffect(() => {
    sessionRef.current = session ?? null;
  }, [session]);

  const signIn = useCallback(async (asGuest: boolean, response?: LoginResponse | undefined) => {
    try {
      if (asGuest) {
        const guestUser = createGuestUser();
        const guestToken = createAuthToken('guest-token', guestUser);
        setSession(guestToken);
        setCurrentUser(guestUser);
      } else {
        if (!response) throw new Error('Login response is undefined');
        validatedTokenRef.current = response.token;
        const authTokenString = createAuthToken(response.token, response.user);
        setSession(authTokenString);
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    try {
      validatedTokenRef.current = null;
      registeredPushForRef.current = null;
      webSocketService.resetConnection();
      setSession(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }, [setSession]);

  const persistRefreshedToken = useCallback((token: string, user: User) => {
    validatedTokenRef.current = token;
    setSession(createAuthToken(token, user));
  }, [setSession]);

  const validateSession = useCallback(async (force = false) => {
    const stored = sessionRef.current;
    if (!stored) return;

    const tokenData = parseAuthToken(stored);
    if (!tokenData) {
      await signOut();
      return;
    }

    if (tokenData.user.guest) return;
    if (isValidatingRef.current) return;
    if (!force && validatedTokenRef.current === tokenData.token) return;

    isValidatingRef.current = true;

    try {
      const check = await checkSession(tokenData.token);

      if (check.ok) {
        validatedTokenRef.current = tokenData.token;
        lastValidatedAtRef.current = Date.now();

        if (check.shouldRefresh) {
          const refresh = await refreshToken(tokenData.token);
          if (refresh.token) persistRefreshedToken(refresh.token, tokenData.user);
        }
        return;
      }

      if (isAuthRejection(check.status)) {
        const refresh = await refreshToken(tokenData.token);

        if (refresh.token) {
          persistRefreshedToken(refresh.token, tokenData.user);
          return;
        }

        if (isAuthRejection(refresh.status)) {
          console.info('Session can no longer be refreshed, signing out.');
          await signOut();
        }
        return;
      }

      console.warn(`Session check returned ${check.status}, keeping session.`);
    } catch (error) {
      console.warn('Session check unreachable, keeping session:', error);
    } finally {
      isValidatingRef.current = false;
    }
  }, [persistRefreshedToken, signOut]);

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      setCurrentUser(null);
      setUserLoading(false);
      return;
    }

    const tokenData = parseAuthToken(session);

    if (!tokenData) {
      setSession(null);
      setCurrentUser(null);
      setUserLoading(false);
      return;
    }

    setCurrentUser(tokenData.user);
    setUserLoading(false);
  }, [session, isLoading, setSession]);

  useEffect(() => {
    if (isLoading || !session) return;
    validateSession();
  }, [session, isLoading, validateSession]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active') return;

      const stored = sessionRef.current;
      if (!stored) return;

      const tokenData = parseAuthToken(stored);
      if (!tokenData || tokenData.user.guest) return;

      const isStale = Date.now() - lastValidatedAtRef.current > REVALIDATE_INTERVAL_MS;
      if (isStale || shouldRefreshToken(tokenData)) validateSession(true);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [validateSession]);

  const displayName = currentUser?.displayName;
  const userId = currentUser?._id;

  useEffect(() => {
    if (displayName && userId) {
      webSocketService.authenticateUser(displayName, userId);

      if (registeredPushForRef.current !== displayName) {
        registeredPushForRef.current = displayName;

        registerForPushNotificationsAsync(displayName).then(token => {
          if (token) {
            saveExpoToken(userId, token);
            setExpoPushToken(token);
          }
        });
      }
    } else if (!session && !isLoading && !userLoading) {
      webSocketService.clearUserData();
      webSocketService.disconnect();
    }
  }, [displayName, userId, isLoading, userLoading, session]);

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
