import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/auth';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${verificationToken}`;

    // Send verification email
    const emailHtml = generateVerificationEmailHtml(verificationUrl, user.name);
    const result = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Mini Bank',
      html: emailHtml,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
