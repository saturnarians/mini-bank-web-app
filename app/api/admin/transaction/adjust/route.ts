import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { transactionController } from '@/lib/controllers/transactionController';
import { adminAdjustBalanceSchema } from '@/lib/schemas';

export const POST = authorize(
  ['admin', 'superadmin'],
  async (req, { session }) => {
    const body = adminAdjustBalanceSchema.parse(await req.json());

    const xff = req.headers.get('x-forwarded-for');
    const xRealIp = req.headers.get('x-real-ip');
    const ipAddress = xff ? xff.split(',')[0].trim() : (xRealIp || 'unknown');

    const tx = await transactionController.adminAdjustBalance({
      admin: {
        id: session.id,
        email: session.email,
      },
      ipAddress,
      body,
    });

    return NextResponse.json(tx, { status: 201 });
  }
);
