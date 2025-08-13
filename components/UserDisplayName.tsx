import { useUsersCache } from '@/lib/hooks/useUsersCache';
import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';

interface UserDisplayNameProps extends TextProps {
  userDisplayName?: string;
  userFinished?: boolean;
  userId?: string;
  fallback?: string;
  loadingText?: string;
}

export default function UserDisplayName({
  userDisplayName,
  userFinished,
  userId,
  fallback,
  loadingText = "Loading...",
  ...textProps
}: UserDisplayNameProps) {
  const { getUserDisplayName, isLoading, getCachedUser } = useUsersCache();
  const [displayName, setDisplayName] = useState<string>('');

  const identifier = userDisplayName || userId;

  useEffect(() => {
    if (!identifier) {
      setDisplayName(fallback || 'Unknown User');
      return;
    }

    if (userDisplayName) {
      setDisplayName(userDisplayName);
      return;
    }

    const cachedUser = getCachedUser(identifier);
    if (cachedUser !== undefined) {
      setDisplayName(cachedUser?.displayName || fallback || identifier);
      return;
    }

    getUserDisplayName(identifier).then(name => {
      setDisplayName(name);
    });
  }, [identifier, userDisplayName, getUserDisplayName, getCachedUser, fallback]);

  const isCurrentlyLoading = isLoading(identifier || '');
  const text = isCurrentlyLoading ? loadingText : displayName || fallback || identifier || 'Unknown User';

  return <Text
    {...textProps}
    className={userFinished === true ? "text-green-500" : undefined}
  >
    {text}
  </Text>;
}
