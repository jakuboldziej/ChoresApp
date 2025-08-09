import { useUsersCache } from '@/lib/hooks/useUsersCache';
import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';

interface UserDisplayNameProps extends TextProps {
  userId: string;
  fallback?: string;
  loadingText?: string;
}

export default function UserDisplayName({
  userId,
  fallback,
  loadingText = "Loading...",
  ...textProps
}: UserDisplayNameProps) {
  const { getUserDisplayName, isLoading, getCachedUser } = useUsersCache();
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    // Check if user is already cached
    const cachedUser = getCachedUser(userId);
    if (cachedUser !== undefined) {
      setDisplayName(cachedUser?.displayName || fallback || userId);
      return;
    }

    // Fetch user display name
    getUserDisplayName(userId).then(name => {
      setDisplayName(name);
    });
  }, [userId, getUserDisplayName, getCachedUser, fallback]);

  const isCurrentlyLoading = isLoading(userId);
  const text = isCurrentlyLoading ? loadingText : displayName || fallback || userId;

  return <Text {...textProps}>{text}</Text>;
}
