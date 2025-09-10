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
    console.log('Verifying token:', token);
    const payload: TokenPayload = JSON.parse(atob(token));
    console.log('Parsed payload:', payload);
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      console.log('Token expired');
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
  // For client-side auth status checking
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me');
      return response.ok;
    } catch {
      return false;
    }
  },
  
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};