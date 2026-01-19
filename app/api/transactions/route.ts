// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { transactionController } from "@/lib/controllers/transactionController";

export const GET = authorize(["user", "admin", "superadmin"], async (req, { session }) => {
  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor") || undefined;
  const limit = searchParams.get("limit") || undefined;

  const result = await transactionController.list(session, {
    cursor,
    limit,
  });

  return NextResponse.json(result);
});
