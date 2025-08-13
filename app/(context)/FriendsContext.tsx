import { parseAuthToken } from '@/lib/auth';
import { apiUrl } from '@/lib/constants';
import { useFriendsWebSocket } from '@/lib/websocket/useWebSocket';
import { getItemAsync } from 'expo-secure-store';
import { createContext, use, useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { Alert } from 'react-native';
import { useSession } from './AuthContext';

export interface FriendRequest {
  _id: string;
  displayName: string;
  friendsCode?: string;
}

interface FriendsContextType {
  friendRequestsCount: number;
  onlineUsers: any[];
  recentFriendRequest: { from: string; to: string } | null;
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  friends: string[];
  clearRecentFriendRequest: () => void;
  refreshFriendRequests: () => Promise<void>;
  sendFriendRequest: (friendCode: string) => Promise<boolean>;
  acceptFriendRequest: (userDisplayName: string) => Promise<boolean>;
  declineFriendRequest: (userDisplayName: string) => Promise<boolean>;
  cancelFriendRequest: (userDisplayName: string) => Promise<boolean>;
  removeFriend: (userDisplayName: string) => Promise<boolean>;
}

const FriendsContext = createContext<FriendsContextType>({
  friendRequestsCount: 0,
  onlineUsers: [],
  recentFriendRequest: null,
  pendingRequests: [],
  sentRequests: [],
  friends: [],
  clearRecentFriendRequest: () => { },
  refreshFriendRequests: async () => { },
  sendFriendRequest: async () => false,
  acceptFriendRequest: async () => false,
  declineFriendRequest: async () => false,
  cancelFriendRequest: async () => false,
  removeFriend: async () => false,
});

export function useFriends() {
  const value = use(FriendsContext);
  if (!value) throw new Error('useFriends must be wrapped in a <FriendsProvider />');
  return value;
}

export function FriendsProvider({ children }: PropsWithChildren) {
  const { user } = useSession();
  const {
    friendRequestsCount,
    onlineUsers,
    recentFriendRequest,
    recentFriendAcceptance,
    recentFriendDecline,
    recentFriendCancel,
    recentFriendRemoval,
    clearRecentFriendRequest,
    clearRecentFriendAcceptance,
    clearRecentFriendDecline,
    clearRecentFriendCancel,
    clearRecentFriendRemoval
  } = useFriendsWebSocket();

  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    if (recentFriendRequest) {
      const { from, to } = recentFriendRequest;

      if (to === user?.displayName) {
        Alert.alert(
          'Nowe zaproszenie do znajomych',
          `${from} wysłał Ci zaproszenie do znajomych`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearRecentFriendRequest();
                refreshFriendRequests();
              }
            }
          ]
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendRequest, user?.displayName, clearRecentFriendRequest]);

  const refreshFriendRequests = useCallback(async () => {
    if (!user?.displayName) return;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/${user.displayName}`, {
        headers: {
          "Authorization": session && typeof session.token === "string" ? session.token : ""
        }
      });
      const userData = await response.json();

      if (userData && userData.friendsRequests?.received) {
        const requestPromises = userData.friendsRequests.received.map(async (userId: string) => {
          const userResponse = await fetch(`${apiUrl}/auth/users/${userId}`, {
            headers: {
              "Authorization": session && typeof session.token === "string" ? session.token : ""
            }
          });
          return await userResponse.json();
        });

        const requestUsers = await Promise.all(requestPromises);
        setPendingRequests(requestUsers.filter(user => user && user._id));
      }

      if (userData && userData.friendsRequests?.pending) {
        const sentPromises = userData.friendsRequests.pending.map(async (userId: string) => {
          const userResponse = await fetch(`${apiUrl}/auth/users/${userId}`, {
            headers: {
              "Authorization": session && typeof session.token === "string" ? session.token : ""
            }
          });
          return await userResponse.json();
        });

        const sentUsers = await Promise.all(sentPromises);
        setSentRequests(sentUsers.filter(user => user && user._id));
      }

      if (userData && userData.friends) {
        setFriends(userData.friends);
      }
    } catch (error) {
      console.error('Failed to refresh friend requests:', error);
    }
  }, [user?.displayName]);

  const sendFriendRequest = async (friendCode: string): Promise<boolean> => {
    if (!user?.displayName) return false;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/send-friends-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session && typeof session.token === "string" ? session.token : ""
        },
        body: JSON.stringify({
          currentUserDisplayName: user.displayName,
          userFriendCode: friendCode
        })
      });

      const result = await response.json();

      if (result.message && !result.message.includes('error')) {
        await refreshFriendRequests();
        return true;
      } else {
        Alert.alert('Błąd', result.message || 'Nie udało się wysłać zaproszenia');
        return false;
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      Alert.alert('Błąd', 'Nie udało się wysłać zaproszenia');
      return false;
    }
  };

  const acceptFriendRequest = async (userDisplayName: string): Promise<boolean> => {
    if (!user?.displayName) return false;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/accept-friends-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session && typeof session.token === "string" ? session.token : ""
        },
        body: JSON.stringify({
          currentUserDisplayName: user.displayName,
          userDisplayName: userDisplayName
        })
      });

      const result = await response.json();

      if (result.message && !result.message.includes('error')) {
        await refreshFriendRequests();
        return true;
      } else {
        Alert.alert('Błąd', result.message || 'Nie udało się zaakceptować zaproszenia');
        return false;
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      Alert.alert('Błąd', 'Nie udało się zaakceptować zaproszenia');
      return false;
    }
  };

  const declineFriendRequest = async (userDisplayName: string): Promise<boolean> => {
    if (!user?.displayName) return false;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/decline-friends-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session && typeof session.token === "string" ? session.token : ""
        },
        body: JSON.stringify({
          currentUserDisplayName: user.displayName,
          userDisplayName: userDisplayName
        })
      });

      const result = await response.json();

      if (result.message && !result.message.includes('error')) {
        await refreshFriendRequests();
        return true;
      } else {
        Alert.alert('Błąd', result.message || 'Nie udało się odrzucić zaproszenia');
        return false;
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      Alert.alert('Błąd', 'Nie udało się odrzucić zaproszenia');
      return false;
    }
  };

  const cancelFriendRequest = async (userDisplayName: string): Promise<boolean> => {
    if (!user?.displayName) return false;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/cancel-friends-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session && typeof session.token === "string" ? session.token : ""
        },
        body: JSON.stringify({
          currentUserDisplayName: user.displayName,
          userDisplayName: userDisplayName
        })
      });

      const result = await response.json();

      if (result.message && !result.message.includes('error')) {
        await refreshFriendRequests();
        return true;
      } else {
        Alert.alert('Błąd', result.message || 'Nie udało się anulować zaproszenia');
        return false;
      }
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      Alert.alert('Błąd', 'Nie udało się anulować zaproszenia');
      return false;
    }
  };

  const removeFriend = async (userDisplayName: string): Promise<boolean> => {
    if (!user?.displayName) return false;

    try {
      const sessionString = await getItemAsync("session");
      const session = sessionString ? parseAuthToken(sessionString) : null;

      const response = await fetch(`${apiUrl}/auth/users/remove-friend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session && typeof session.token === "string" ? session.token : ""
        },
        body: JSON.stringify({
          currentUserDisplayName: user.displayName,
          userDisplayName: userDisplayName
        })
      });

      const result = await response.json();

      if (result.message && !result.message.includes('error')) {
        await refreshFriendRequests();
        return true;
      } else {
        Alert.alert('Błąd', result.message || 'Nie udało się usunąć znajomego');
        return false;
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      Alert.alert('Błąd', 'Nie udało się usunąć znajomego');
      return false;
    }
  };

  useEffect(() => {
    if (user?.displayName) {
      refreshFriendRequests();
    } else {
      setPendingRequests([]);
      setSentRequests([]);
      setFriends([]);
    }
  }, [user?.displayName, refreshFriendRequests]);

  useEffect(() => {
    if (recentFriendAcceptance) {
      const { accepted, sentFrom, sentTo } = recentFriendAcceptance;

      if (accepted && sentFrom === user?.displayName) {
        Alert.alert(
          'Zaproszenie zaakceptowane!',
          `${sentTo} zaakceptował Twoje zaproszenie do znajomych`,
          [
            {
              text: 'OK', onPress: () => {
                clearRecentFriendAcceptance();
                refreshFriendRequests();
              }
            }
          ]
        );
      } else {
        clearRecentFriendAcceptance();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendAcceptance, user?.displayName]);

  useEffect(() => {
    if (recentFriendDecline) {
      const { declined, sentFrom } = recentFriendDecline;

      if (declined && sentFrom === user?.displayName) {
        clearRecentFriendDecline();
        refreshFriendRequests();
      } else {
        clearRecentFriendDecline();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendDecline, user?.displayName]);

  useEffect(() => {
    if (recentFriendCancel) {
      const { canceled, sentTo } = recentFriendCancel;

      if (canceled && sentTo === user?.displayName) {
        clearRecentFriendRemoval();
        refreshFriendRequests();
      } else {
        clearRecentFriendCancel();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendCancel, user?.displayName]);

  useEffect(() => {
    if (recentFriendRequest && recentFriendRequest.to === user?.displayName) {
      refreshFriendRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendRequest, user?.displayName]);

  useEffect(() => {
    if (recentFriendRemoval) {
      const { removed, removedUser } = recentFriendRemoval;

      if (removed && removedUser === user?.displayName) {
        clearRecentFriendRemoval();
        refreshFriendRequests();
      } else {
        clearRecentFriendRemoval();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentFriendRemoval, user?.displayName]);

  return (
    <FriendsContext
      value={{
        friendRequestsCount,
        onlineUsers,
        recentFriendRequest,
        pendingRequests,
        sentRequests,
        friends,
        clearRecentFriendRequest,
        refreshFriendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
      }}>
      {children}
    </FriendsContext>
  );
}
