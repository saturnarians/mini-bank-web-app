import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, setTokenCookie, generateVerificationToken } from '@/lib/auth';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        emailVerified: false,
      },
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${verificationToken}`;

    // Send verification email
    const emailHtml = generateVerificationEmailHtml(verificationUrl, name);
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Mini Bank',
      html: emailHtml,
    });

    // Generate session token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setTokenCookie(token);

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
