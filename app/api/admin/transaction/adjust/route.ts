import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { transactionController } from '@/lib/controllers/transactionController';
import { adminAdjustBalanceSchema } from '@/lib/schemas';

export const POST = authorize(
  ['admin', 'superadmin'],
  async (req, { params, session }) => {
    const body = adminAdjustBalanceSchema.parse(
      await req.json()
    );

    const tx = await transactionController.adminAdjustBalance({
        adminId: session.id,
        accountId: params.accountId,
        body,
      });

    return NextResponse.json(tx, { status: 201 });
  }
);
