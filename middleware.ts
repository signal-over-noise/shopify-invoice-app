// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyToken(token: string): any | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for:', pathname);
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(pathname)) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  // Public API routes
  if (pathname.startsWith('/api/auth/')) {
    console.log('Auth API route, allowing access');
    return NextResponse.next();
  }

  // Check if this is a protected route
  const protectedRoutes = ['/dashboard', '/test'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    console.log('Protected route detected:', pathname);
    
    // Try to get token from multiple sources
    const cookieToken = request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    const token = cookieToken || bearerToken;
    
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log('Token valid, allowing access');
  }

  // For API routes that need protection (excluding auth routes)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};