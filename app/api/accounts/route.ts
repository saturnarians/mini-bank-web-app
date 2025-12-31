import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.id,
      },
      include: {
        transactions: {
          take: 5,
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountType, balance = 0 } = await request.json();

    // Generate unique account number
    const accountNumber = `ACC${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    const account = await prisma.account.create({
      data: {
        userId: session.id,
        accountNumber,
        accountType,
        balance,
        currency: 'USD',
        status: 'active',
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
