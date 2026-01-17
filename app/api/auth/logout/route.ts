import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST() {
  // 1. Call the 
  const response =  NextResponse.json({ message: 'Logged out successfully' })
  // 2. Clear the cookie for server-side headers
  await removeTokenCookie();
  
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // 3. Explicitly expire the cookie on the response object
  // response.cookies.set('token', '', {
  //   httpOnly: true,
  //   expires: new Date(0), // Sets expiration to 1970 (instant delete)
  //   path: '/',
  // });

  return response;
}