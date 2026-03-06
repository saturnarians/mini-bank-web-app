import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

function generateAccountNumber() {
  return `AC${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

// GET: Fetch all users or search
export const GET = authorize(['admin', 'superadmin'], async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  const users = await prisma.user.findMany({
    where: query ? {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    } : {},
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      role: true,
      status: true,
      createdAt: true,
      accounts: { select: { id: true, balance: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(users);
});

// POST: Create a new user (Admin functionality)
export const POST = authorize(['admin', 'superadmin'], async (req) => {
  const body = await req.json();
  const { email, password, name, role, accountType } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      role: role || 'user',
      password: hashedPassword,
      accounts: {
        create: {
          balance: 0,
          currency: 'USD',
          accountType: accountType || 'checking',
          accountNumber: generateAccountNumber(),
        }
      }
    }
  });

  return NextResponse.json(newUser, { status: 201 });
});
