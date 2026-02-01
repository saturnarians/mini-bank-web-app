import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { transactionService } from '@/lib/services/transactionService';
import { z } from 'zod';

const schema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive(),
  recipientBank: z.string().min(1),
  recipientAccountNumber: z.string().min(1),
  description: z.string().optional(),
});

export const POST = authorize(['user'], async (req, { session }) => {
  const body = await req.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const tx = await transactionService.createExternalTransfer({
      userId: session.id,
      accountId: parsed.data.accountId,
      amount: parsed.data.amount,
      recipientBank: parsed.data.recipientBank,
      recipientAccountNumber: parsed.data.recipientAccountNumber,
      description: parsed.data.description,
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 400 });
  }
});
