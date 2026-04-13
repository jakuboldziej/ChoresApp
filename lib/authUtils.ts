export interface User {
  _id: string;
  displayName: string;
  email: string;
  role?: string;
  verified?: string;
  online?: string;
  friends?: string;
  friendsCode?: string;
  guest?: boolean;
  friendsRequests?: {
    pending: string[];
    received: string[];
  };
}

export interface AuthToken {
  token: string;
  expiresAt: number;
  user: User;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
  friendsRequestsReceived: string;
}

export function parseAuthToken(tokenString: string): AuthToken | null {
  try {
    const token = JSON.parse(tokenString);

    if (token.expiresAt && Date.now() > token.expiresAt) {
      return null;
    }

    if (
      !token.token ||
      !token.user ||
      !token.user._id ||
      !token.user.displayName
    ) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

export function createAuthToken(
  token: string,
  user: User,
  expiresInDays: number = 7,
): string {
  const authToken: AuthToken = {
    token,
    expiresAt: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    user,
  };

  return JSON.stringify(authToken);
}

export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  return { isValid: true };
}

export function isGuestUser(user: User | null): boolean {
  return user?.guest === true;
}

export function createGuestUser(): User {
  return {
    _id: `guest-${Date.now()}`,
    displayName: "gość",
    email: `guest-${Date.now()}@email.com`,
    guest: true,
  };
}
