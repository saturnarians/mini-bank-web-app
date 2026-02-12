// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { transactionController } from "@/lib/controllers/transactionController";
import { createTransactionSchema } from "@/lib/schemas";

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
  async (req, { params, session }) => {
    // parse and validate the request body; accountId must be provided in body
    const body = createTransactionSchema.parse(await req.json());

    const tx = await transactionController.createUserTransaction({
      session,
      accountId: params.accountId,
      body,
    });

    return NextResponse.json(tx, { status: 201 });
  }
);

