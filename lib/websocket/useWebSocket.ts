import { useEffect, useRef, useState } from 'react';
import { WebSocketEventName, WebSocketEvents, webSocketService } from './WebSocketService';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      try {
        setIsConnected(webSocketService.getConnectionStatus());
      } catch {
        setIsConnected(false);
        setConnectionError('WebSocket service not available');
      }
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const connect = (displayName: string, userId: string) => {
    try {
      webSocketService.authenticateUser(displayName, userId);
      setConnectionError(null);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const disconnect = () => {
    webSocketService.disconnect();
    setIsConnected(false);
  };

  const emit = (eventName: string, data: any) => {
    webSocketService.emit(eventName, data);
  };

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    service: webSocketService
  };
}

export function useWebSocketEvent<T extends WebSocketEventName>(
  eventName: T,
  handler: WebSocketEvents[T]
) {
  const handlerRef = useRef(handler);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler = (data: any) => {
      handlerRef.current(data);
    };

    unsubscribeRef.current = webSocketService.addEventListener(eventName, wrappedHandler);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [eventName]);
}

export function useFriendsWebSocket() {
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [recentFriendRequest, setRecentFriendRequest] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [recentFriendAcceptance, setRecentFriendAcceptance] = useState<{
    accepted: boolean;
    sentFrom: string;
    sentTo: string;
  } | null>(null);
  const [recentFriendDecline, setRecentFriendDecline] = useState<{
    declined: boolean;
    sentFrom: string;
    sentTo: string;
  } | null>(null);
  const [recentFriendCancel, setRecentFriendCancel] = useState<{
    canceled: boolean;
    sentFrom: string;
    sentTo: string;
  } | null>(null);
  const [recentFriendRemoval, setRecentFriendRemoval] = useState<{
    removed: boolean;
    removedBy: string;
    removedUser: string;
  } | null>(null);

  useWebSocketEvent('sendFriendsRequest', (data) => {
    setRecentFriendRequest({
      from: data.currentUserDisplayName,
      to: data.userDisplayName
    });
    setFriendRequestsCount(data.friendsRequestsReceived);
  });

  useWebSocketEvent('acceptFriendsRequest', (data) => {
    setRecentFriendAcceptance(data);
  });

  useWebSocketEvent('declineFriendsRequest', (data) => {
    setRecentFriendDecline(data);
  });

  useWebSocketEvent('cancelFriendsRequest', (data) => {
    setRecentFriendCancel(data);
  });

  useWebSocketEvent('removeFriend', (data) => {
    setRecentFriendRemoval(data);
  });

  useWebSocketEvent('updateCounters', (data) => {
    if (data.friendsRequestsReceived !== undefined) {
      setFriendRequestsCount(data.friendsRequestsReceived);
    }
  });

  useWebSocketEvent('onlineUsersListener', (data) => {
    setOnlineUsers(data.updatedOnlineUsers);
  });

  const clearRecentFriendRequest = () => {
    setRecentFriendRequest(null);
  };

  const clearRecentFriendAcceptance = () => {
    setRecentFriendAcceptance(null);
  };

  const clearRecentFriendDecline = () => {
    setRecentFriendDecline(null);
  };

  const clearRecentFriendCancel = () => {
    setRecentFriendCancel(null);
  };

  const clearRecentFriendRemoval = () => {
    setRecentFriendRemoval(null);
  };

  return {
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
  };
}

export function useChoresWebSocket() {
  const [recentChoreUpdate, setRecentChoreUpdate] = useState<any>(null);

  useWebSocketEvent('choreCreated', (data) => {
    setRecentChoreUpdate({ type: 'created', ...data });
  });

  useWebSocketEvent('choreUpdated', (data) => {
    setRecentChoreUpdate({ type: 'updated', ...data });
  });

  useWebSocketEvent('choreCompleted', (data) => {
    setRecentChoreUpdate({ type: 'completed', ...data });
  });

  const clearRecentChoreUpdate = () => {
    setRecentChoreUpdate(null);
  };

  return {
    recentChoreUpdate,
    clearRecentChoreUpdate
  };
}
