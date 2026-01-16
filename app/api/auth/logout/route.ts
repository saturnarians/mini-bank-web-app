import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST() {
  await removeTokenCookie();
  
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  return response;
}