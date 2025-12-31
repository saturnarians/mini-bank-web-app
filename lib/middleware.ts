import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './auth';

const protectedRoutes = [
  '/dashboard',
  '/accounts',
  '/transactions',
  '/profile',
  '/admin',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const session = await getSession();

    if (!session) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
