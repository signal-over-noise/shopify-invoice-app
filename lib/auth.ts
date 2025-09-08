// lib/auth.ts
interface TokenPayload {
  username: string;
  exp: number;
  iat: number;
}

/**
 * Creates a simple JWT-like token using base64 encoding
 */
export function createToken(username: string): string {
  const payload: TokenPayload = {
    username,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  const token = btoa(JSON.stringify(payload));
  return token;
}

/**
 * Verifies and decodes the token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload: TokenPayload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Validates admin credentials
 */
export function validateCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

/**
 * Client-side token management
 */
export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    
    const payload = verifyToken(token);
    return payload !== null;
  }
};