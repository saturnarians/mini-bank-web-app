// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { ZodError } from 'zod';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await authController.login(body);

    const token = await signToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });

  await setTokenCookie(token);
  

const response = NextResponse.json({
  user: { id: user.id, email: user.email, name: user.name, role: user.role }
});

// THIS IS THE CRITICAL PART
response.cookies.set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
});

    return NextResponse.json({ user });
  } catch (error: any) {
    // Specific error handling
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    if (error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
