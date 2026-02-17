// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { ZodError } from 'zod';
import { setTokenCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';
import { sendVerificationOtpAndSetCookie } from '@/lib/emailVerification';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    const { user, token, expiresIn } = await authController.login(body);

    if (!user.emailVerified) {
      const response = NextResponse.json(
        {
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Email is not verified. We sent a new OTP to your inbox.',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );

      await sendVerificationOtpAndSetCookie({
        response,
        email: user.email,
        name: user.name,
      });

      return response;
    }

    const response = NextResponse.json(user, { status: 200 });
    setTokenCookie(response, token, expiresIn);

    return response;
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json(
        {
          error: 'User not found',
          redirectTo: '/register',
        },
        { status: 404 }
      );
    }

    if (error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.error("Login Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
