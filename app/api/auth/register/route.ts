import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { ZodError } from 'zod';
import { sendVerificationOtpAndSetCookie } from '@/lib/emailVerification';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = await authController.register(body);

    const response = NextResponse.json(
      {
        requiresVerification: true,
        message: 'Account created. Check your email for OTP verification.',
        email: user.email,
      },
      { status: 201 }
    );

    await sendVerificationOtpAndSetCookie({
      response,
      email: user.email,
      name: user.name,
    });

    return response;
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message }, 
        { status: 400 }
      );
    }

    if (err.message === 'USER_EXISTS') {
      return NextResponse.json(
        {
          error: 'User with this email already exists',
          redirectTo: '/login',
        }, 
        { status: 409 } // 409 is better for conflicts
      );
    }

    console.error("Registration Route Error:", err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
