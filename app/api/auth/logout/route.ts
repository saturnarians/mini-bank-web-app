import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await removeTokenCookie();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
