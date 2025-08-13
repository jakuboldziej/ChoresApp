import { io, Socket } from 'socket.io-client';

export interface WebSocketEvents {
  // Friends events
  'sendFriendsRequest': (data: {
    friendsRequestsReceived: number;
    currentUserDisplayName: string;
    userDisplayName: string;
  }) => void;
  
  'acceptFriendsRequest': (data: {
    accepted: boolean;
    sentFrom: string;
    sentTo: string;
  }) => void;
  
  'declineFriendsRequest': (data: {
    declined: boolean;
    sentFrom: string;
    sentTo: string;
  }) => void;
  
  'cancelFriendsRequest': (data: {
    canceled: boolean;
    sentFrom: string;
    sentTo: string;
  }) => void;
  
  'removeFriend': (data: {
    removed: boolean;
    removedBy: string;
    removedUser: string;
  }) => void;
  
  'updateCounters': (data: {
    currentUserDisplayName: string;
    friendsRequestsReceived?: number;
    friendsRequestsPending?: number;
  }) => void;
  
  // Online status events
  'onlineUsersListener': (data: {
    updatedOnlineUsers: any[];
    updatedUser: {
      _id: string;
      displayName: string;
    };
    isUserOnline: boolean;
  }) => void;
  
  // Chore events
  'choreCreated': (data: {
    choreId: string;
    title: string;
    assignedUsers: string[];
  }) => void;
  
  'choreUpdated': (data: {
    choreId: string;
    title: string;
    changes: any;
  }) => void;
  
  'choreCompleted': (data: {
    choreId: string;
    completedBy: string;
  }) => void;
}

export type WebSocketEventName = keyof WebSocketEvents;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventListeners: Map<string, Function[]> = new Map();
  private userDisplayName: string | null = null;
  private userId: string | null = null;
  private authenticationTimer: any = null;
  private isAuthenticating: boolean = false;

  constructor() {
    try {
      this.initializeConnection();
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  private getServerUrl(): string {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    
    let url: string;
    if (apiUrl) {
      url = apiUrl.replace('/api', '');
    } else {
      console.warn('no apiUrl');
      return "";
    }
    
    return url;
  }

  private initializeConnection() {
    const serverUrl = this.getServerUrl();
    
    this.socket = io(serverUrl, {
      transports: ['polling', 'websocket'], 
      upgrade: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: false, 
      autoConnect: true,
      query: {
        transport: 'polling'
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.userDisplayName && this.userId && !this.isAuthenticating) {
        setTimeout(() => {
          if (this.userDisplayName && this.userId && !this.isAuthenticating) {
            this.sendAuthenticationData();
          }
        }, 500); 
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isAuthenticating = false;
      if (this.authenticationTimer) {
        clearTimeout(this.authenticationTimer);
        this.authenticationTimer = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        toString: error.toString()
      });
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        console.log('🔄 Disabling WebSocket - continuing without real-time features');
        this.socket?.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.setupDefaultEventListeners();
  }

  private setupDefaultEventListeners() {
    if (!this.socket) return;

    this.socket.on('userAuthenticated', (data: any) => {
      console.log('✅ User authentication confirmed by server:', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Connect error:', error);
    });

    this.socket.on('sendFriendsRequest', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('sendFriendsRequest', parsedData);
      } catch (error) {
        console.error('Error parsing sendFriendsRequest data:', error);
      }
    });

    this.socket.on('acceptFriendsRequest', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('acceptFriendsRequest', parsedData);
      } catch (error) {
        console.error('Error parsing acceptFriendsRequest data:', error);
      }
    });

    this.socket.on('declineFriendsRequest', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('declineFriendsRequest', parsedData);
      } catch (error) {
        console.error('Error parsing declineFriendsRequest data:', error);
      }
    });

    this.socket.on('cancelFriendsRequest', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('cancelFriendsRequest', parsedData);
      } catch (error) {
        console.error('Error parsing cancelFriendsRequest data:', error);
      }
    });

    this.socket.on('removeFriend', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('removeFriend', parsedData);
      } catch (error) {
        console.error('Error parsing removeFriend data:', error);
      }
    });

    this.socket.on('updateCounters', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('updateCounters', parsedData);
      } catch (error) {
        console.error('Error parsing updateCounters data:', error);
      }
    });

    this.socket.on('onlineUsersListener', (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        this.emitToListeners('onlineUsersListener', parsedData);
      } catch (error) {
        console.error('Error parsing onlineUsersListener data:', error);
      }
    });
  }

  private emitToListeners(eventName: string, data: any) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${eventName} listener:`, error);
      }
    });
  }

  // Public API

  authenticateUser(displayName: string, userId: string) {
    this.userDisplayName = displayName;
    this.userId = userId;
    
    if (this.authenticationTimer) {
      clearTimeout(this.authenticationTimer);
      this.authenticationTimer = null;
    }
    
    if (this.isAuthenticating) {
      return;
    }
    
    this.isAuthenticating = true;

    if (this.socket && this.isConnected) {
      this.sendAuthenticationData();
      this.isAuthenticating = false;
    } else if (this.socket && !this.isConnected) {
      this.waitForConnectionAndAuthenticate();
    } else {
      this.reconnect();
      this.waitForConnectionAndAuthenticate();
    }
  }

  private sendAuthenticationData() {
    if (this.socket && this.isConnected && this.userDisplayName && this.userId) {
      this.socket.emit('addingOnlineUser', JSON.stringify({
        user: {
          _id: this.userId,
          displayName: this.userDisplayName
        }
      }));
    } else {
      console.log('🔐 Cannot send authentication data - missing data:', {
        hasSocket: !!this.socket,
        isConnected: this.isConnected,
        userDisplayName: this.userDisplayName,
        userId: this.userId
      });
    }
  }

  private waitForConnectionAndAuthenticate() {
    let attempts = 0;
    const maxAttempts = 10;
    
    if (this.authenticationTimer) {
      clearTimeout(this.authenticationTimer);
    }
    
    const checkConnection = () => {
      attempts++;
      
      if (this.socket && this.isConnected) {
        this.sendAuthenticationData();
        this.isAuthenticating = false;
        this.authenticationTimer = null;
      } else if (attempts < maxAttempts && this.authenticationTimer) {
        this.authenticationTimer = setTimeout(checkConnection, 500);
      } else {
        console.error('🔐 Failed to connect within timeout, authentication aborted');
        this.isAuthenticating = false;
        this.authenticationTimer = null;
      }
    };
    
    this.authenticationTimer = setTimeout(checkConnection, 100);
  }

  addEventListener<T extends WebSocketEventName>(
    eventName: T,
    listener: WebSocketEvents[T]
  ): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    
    this.eventListeners.get(eventName)!.push(listener);

    return () => {
      const listeners = this.eventListeners.get(eventName) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  removeEventListener<T extends WebSocketEventName>(
    eventName: T,
    listener: WebSocketEvents[T]
  ) {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(eventName: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected. Message not sent:', eventName);
    }
  }

  joinRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinRoom', roomName);
    } else {
      console.warn('WebSocket not connected. Cannot join room:', roomName);
    }
  }

  leaveRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveRoom', roomName);
    } else {
      console.warn('WebSocket not connected. Cannot leave room:', roomName);
    }
  }

  disconnect() {
    if (this.authenticationTimer) {
      clearTimeout(this.authenticationTimer);
      this.authenticationTimer = null;
    }
    
    this.isAuthenticating = false;
    
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.isConnected = false;
    } else {
      console.log('🔌 No socket to disconnect');
    }
  }

  clearUserData() {
    if (this.authenticationTimer) {
      clearTimeout(this.authenticationTimer);
      this.authenticationTimer = null;
    }
    
    this.isAuthenticating = false;
    
    this.userDisplayName = null;
    this.userId = null;
  }

  reconnect() {
    this.disconnect();
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      } else {
        this.initializeConnection();
      }
    }, 1000);
  }

  resetConnection() {
    this.clearUserData();
    this.disconnect();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    this.initializeConnection();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getCurrentUser(): { displayName: string | null; userId: string | null } {
    return {
      displayName: this.userDisplayName,
      userId: this.userId
    };
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
