import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login'];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirect to login for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }
  
  // Verify token
  const payload = verifyToken(token!);
  if (!payload) {
    // Redirect to login for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }
  
  // Add user info to request headers for API routes
  if (pathname.startsWith('/api/') && payload) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user', JSON.stringify(payload));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};