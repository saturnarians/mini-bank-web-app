import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { transactionHistoryController } from "@/lib/controllers/transactionHistoryController";
import { ZodError } from "zod";

type Context = {
  params: any;
  session: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
};

/**
 * GET /api/transactions/history
 * Get transaction history for accounts
 * Users: see their own transactions
 * Admins: see any user's transactions
 */
export const GET = authorize(
  ["user", "admin", "superadmin"],
  async (req: NextRequest, context: Context) => {
    try {
      const { session } = context;
      return await transactionHistoryController.getHistory(req, {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role as "user" | "admin" | "superadmin",
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: err.errors?.[0]?.message || "Invalid input" },
          { status: 400 }
        );
      }

      console.error("Get transaction history error:", err);
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }
  }
);
