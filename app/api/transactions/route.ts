import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { transactionController } from '@/lib/controllers/transactionController';
import { transactionService } from '@/lib/services/transactionService';

export const GET = authorize(['user', 'admin'], async (req, { session }) => {
  const transactions = await transactionService.listUserTransactions(session.id);
  return NextResponse.json(transactions);
});

export const POST = authorize(['user'], async (req, { session }) => {
  try {
    const body = await req.json();
    const transaction = await transactionController.create(session.id, body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_FUNDS') {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    throw error;
  }
});