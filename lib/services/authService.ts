import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  generateVerificationToken,
  UserRole,
} from '@/lib/auth';
import { sendEmail, generateVerificationEmailHtml } from '@/lib/email';
import type { User } from '@/lib/types';

export const authService = {
  async register(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'user',
        emailVerified: false,
      },
    });

    // Email verification
    const verificationToken = await generateVerificationToken(user.email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: generateVerificationEmailHtml(verificationUrl, user.name),
    });


    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified,
    };
  },

  async login(data: { email: string; password: string }): Promise<User>{
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new Error('INVALID_CREDENTIALS');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error('INVALID_CREDENTIALS');


    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified,
    };
  },
};
