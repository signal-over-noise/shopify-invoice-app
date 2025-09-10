import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value;
    console.log('Token found:', token);
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const payload = verifyToken(token);
    console.log('Verification result:', payload);
    
    if (!payload) {
      console.log('Token verification failed');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log('Token valid, allowing access');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*'
};