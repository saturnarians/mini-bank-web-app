import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendVerificationOtpAndSetCookie } from '@/lib/emailVerification';

export const dynamic = 'force-dynamic';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', redirectTo: '/register' },
        { status: 404 }
      );
    }

    if (user.role !== "user") {
      return NextResponse.json({ message: 'Verification is not required for this account type.' });
    }

    const response = NextResponse.json({
      message: 'Verification OTP sent successfully',
      requiresVerification: true,
      email: user.email,
    });

    await sendVerificationOtpAndSetCookie({
      response,
      email: user.email,
      name: user.name,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
