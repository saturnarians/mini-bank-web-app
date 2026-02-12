import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyVerificationToken } from '@/lib/auth';
import { sendEmail, generateWelcomeEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Verify the token
    const email = await verifyVerificationToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    // Update user to mark email as verified
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    // Send welcome email
    const welcomeHtml = generateWelcomeEmailHtml(user.name);
    await sendEmail({
      to: email,
      subject: 'Welcome to Mini Bank!',
      html: welcomeHtml,
    });

    // Redirect to dashboard or login page
    return NextResponse.redirect(new URL('/dashboard?verified=true', request.url), 302);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
