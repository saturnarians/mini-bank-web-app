import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { transactionHistoryController } from "@/lib/controllers/transactionHistoryController";
import { ZodError } from "zod";

export const dynamic = 'force-dynamic';

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
 * GET /api/transactions/stats
 * Get transaction statistics for a user
 * Users: see their own stats
 * Admins: see any user's stats
 */
export const GET = authorize(
  ["user", "admin", "superadmin"],
  async (req: NextRequest, context: Context) => {
    try {
      const { session } = context;
      return await transactionHistoryController.getStats(req, {
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

      console.error("Get transaction stats error:", err);
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }
  }
);
