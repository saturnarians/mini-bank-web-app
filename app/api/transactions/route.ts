import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const transactionSchema = z.object({
  accountId: z.string(),
  type: z.enum(['deposit', 'withdrawal', 'transfer']),
  amount: z.number().positive(),
  description: z.string(),
  recipientAccountId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(transactions);
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

    const body = await request.json();
    const { accountId, type, amount, description, recipientAccountId } = transactionSchema.parse(body);

    // Verify account ownership
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== session.id) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        userId: session.id,
        type,
        amount,
        description,
        recipientAccountId,
        reference,
        status: 'completed',
        currency: 'USD',
      },
    });

    // Update account balance
    if (type === 'deposit') {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount,
          },
          lastTransactionAt: new Date(),
        },
      });
    } else if (type === 'withdrawal') {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount,
          },
          lastTransactionAt: new Date(),
        },
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
