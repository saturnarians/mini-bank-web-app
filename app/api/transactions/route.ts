// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { transactionController } from "@/lib/controllers/transactionController";
import { assertTransactionPin } from "@/lib/transaction-pin";

export const dynamic = 'force-dynamic';

// export type AccountId = {
//   accountId: string;
// }

export const GET = authorize(["user", "admin", "superadmin"], async (req, { session }) => {
  const { searchParams } = new URL(req.url);

  const accountId = searchParams.get("accountId") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = searchParams.get("limit") || undefined;

  const result = await transactionController.list(session, {
    accountId,
    cursor,
    limit,
  });

  return NextResponse.json(result);
});

export const POST = authorize(
  ['user'],
  async (req, { session }) => {
    try {
      const body = await req.json();
      const accountId = body?.accountId;
      await assertTransactionPin({
        userId: session.id,
        pin: body?.pin,
      });

      if (!accountId) {
        return NextResponse.json(
          { error: 'ACCOUNT_ID_REQUIRED', message: 'Account is required.' },
          { status: 400 }
        );
      }

      const tx = await transactionController.createUserTransaction({
        session,
        accountId,
        body,
      });

      return NextResponse.json(tx, { status: 201 });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return NextResponse.json(
          { error: 'INVALID_INPUT', message: error.errors?.[0]?.message || 'Invalid input.' },
          { status: 400 }
        );
      }

      switch (error?.message) {
        case 'ACCOUNT_NOT_FOUND':
          return NextResponse.json(
            { error: error.message, message: 'Account not found.' },
            { status: 404 }
          );
        case 'ACCOUNT_SUSPENDED':
          return NextResponse.json(
            { error: error.message, message: 'Account is suspended and cannot make transactions.' },
            { status: 403 }
          );
        case 'USER_SUSPENDED':
          return NextResponse.json(
            { error: error.message, message: 'User account is suspended and cannot make transactions.' },
            { status: 403 }
          );
        case 'RECIPIENT_NOT_FOUND':
          return NextResponse.json(
            { error: error.message, message: 'Recipient account not found.' },
            { status: 404 }
          );
        case 'RECIPIENT_SUSPENDED':
          return NextResponse.json(
            { error: error.message, message: 'Recipient account is suspended.' },
            { status: 403 }
          );
        case 'RECIPIENT_REQUIRED':
          return NextResponse.json(
            { error: error.message, message: 'Recipient account is required for transfers.' },
            { status: 400 }
          );
        case 'CANNOT_TRANSFER_TO_SAME_ACCOUNT':
          return NextResponse.json(
            { error: error.message, message: 'Cannot transfer to the same account.' },
            { status: 400 }
          );
        case 'INSUFFICIENT_FUNDS':
          return NextResponse.json(
            { error: error.message, message: 'Insufficient funds.' },
            { status: 422 }
          );
        case 'INVALID_TRANSACTION_PIN':
          return NextResponse.json(
            { error: error.message, message: 'Invalid transaction PIN.' },
            { status: 403 }
          );
        case 'TRANSACTION_PIN_NOT_SET':
          return NextResponse.json(
            {
              error: error.message,
              message: 'Transaction PIN not set. Create your PIN to continue.',
            },
            { status: 428 }
          );
        case 'USER_NOT_FOUND':
          return NextResponse.json(
            { error: error.message, message: 'User not found.' },
            { status: 404 }
          );
        default:
          console.error('Create transaction error:', error);
          return NextResponse.json(
            { error: 'TRANSACTION_FAILED', message: 'Transaction failed.' },
            { status: 500 }
          );
      }
    }
  }
);

