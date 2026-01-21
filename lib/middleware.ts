// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, signToken } from './auth';
import { canAccessPage } from './permission';
import { resolveDashboardByRole } from './route-resolver';

const protectedRoutes = [
  '/dashboard',
  '/accounts',
  '/transactions',
  '/profile',
  '/admin-panel',
  // '/api/', very bad to protect api in middleware
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const response = NextResponse.next();

  // 1. Get the current session + auth check
  const session = await refreshSession(response);

  // 2. Security Check: If on a protected route and no session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && !canAccessPage(session.role, pathname)) {
  return NextResponse.redirect(new URL(resolveDashboardByRole(session.role), request.url));
}


  // // 3. Sliding Session Logic: If they are logged in, refresh their token
  // const response = NextResponse.next();

  // if (session) {
  //   // Generate a fresh token with a new 20-minute expiry
  //   const newToken = await signToken(
  //     {
  //     id: session.id,
  //     email: session.email,
  //     role: session.role,
  //   });

  //   // Set the updated cookie on the response we are sending back
  //   response.cookies.set('token', newToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'lax',
  //     path: '/',
  //     maxAge: 60 * 20, // Reset timer to 20 minutes
  //   });
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};