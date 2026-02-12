import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { transactionController } from '@/lib/controllers/transactionController';

export const dynamic = 'force-dynamic';

export const POST = authorize(
  ['user', 'admin', 'superadmin'],
  async (req, { params, session }) => {
    const body = await req.json();

    const result = await transactionController.createUserTransaction({
      session,
      accountId: params.accountId,
      body,
    });

    return NextResponse.json(result, { status: 201 });
  }
);
