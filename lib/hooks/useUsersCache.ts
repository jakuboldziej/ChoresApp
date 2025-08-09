import { User } from '@/lib/auth';
import { getUser } from '@/lib/fetch/users';
import { useCallback, useRef, useState } from 'react';

interface UsersCache {
  [userId: string]: User | null;
}

interface UserCacheState {
  cache: UsersCache;
  loading: Set<string>;
}

export function useUsersCache() {
  const [state, setState] = useState<UserCacheState>({
    cache: {},
    loading: new Set()
  });
  const promiseCache = useRef<Map<string, Promise<User | null>>>(new Map());

  const getUserById = useCallback(async (userId: string): Promise<User | null> => {
    // Return cached user if available
    if (state.cache[userId] !== undefined) {
      return state.cache[userId];
    }

    // Return existing promise if already loading
    if (promiseCache.current.has(userId)) {
      return promiseCache.current.get(userId)!;
    }

    // Create new promise and cache it
    const promise = (async () => {
      try {
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading, userId])
        }));

        const userData = await getUser(userId);
        const user = userData && userData._id ? userData : null;

        setState(prev => ({
          cache: { ...prev.cache, [userId]: user },
          loading: new Set([...prev.loading].filter(id => id !== userId))
        }));

        return user;
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        
        setState(prev => ({
          cache: { ...prev.cache, [userId]: null },
          loading: new Set([...prev.loading].filter(id => id !== userId))
        }));

        return null;
      } finally {
        promiseCache.current.delete(userId);
      }
    })();

    promiseCache.current.set(userId, promise);
    return promise;
  }, [state.cache]);

  const getUserDisplayName = useCallback(async (userId: string): Promise<string> => {
    const user = await getUserById(userId);
    return user?.displayName || userId;
  }, [getUserById]);

  const isLoading = useCallback((userId: string): boolean => {
    return state.loading.has(userId);
  }, [state.loading]);

  const getCachedUser = useCallback((userId: string): User | null | undefined => {
    return state.cache[userId];
  }, [state.cache]);

  return {
    getUserById,
    getUserDisplayName,
    isLoading,
    getCachedUser
  };
}
