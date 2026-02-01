import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transactionService";
import { z } from "zod";

interface SessionContext {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin" | "superadmin";
}

// Schemas for validation
const getTransactionHistorySchema = z.object({
  accountId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(["deposit", "withdrawal", "transfer", "adjustment"]).optional(),
  status: z.enum(["completed", "pending", "failed"]).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  skip: z.number().int().min(0).optional().default(0),
});

export const transactionHistoryController = {
  /**
   * Get transaction history for a specific account or all user accounts
   * Users can only view their own transactions
   * Admins can view any user's transactions
   */
  async getHistory(req: NextRequest, session: SessionContext) {
    try {
      const url = new URL(req.url);
      const query = {
        accountId: url.searchParams.get("accountId") || undefined,
        userId: url.searchParams.get("userId") || undefined,
        startDate: url.searchParams.get("startDate") || undefined,
        endDate: url.searchParams.get("endDate") || undefined,
        type: url.searchParams.get("type") || undefined,
        status: url.searchParams.get("status") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "50"),
        skip: parseInt(url.searchParams.get("skip") || "0"),
      };

      // Validate query parameters
      const params = getTransactionHistorySchema.parse(query);

      // Authorization: Users can only see their own transactions
      if (session.role === "user") {
        if (params.userId && params.userId !== session.id) {
          return NextResponse.json(
            { error: "Unauthorized: You can only view your own transactions" },
            { status: 403 }
          );
        }
        params.userId = session.id;
      }

      let result;

      if (params.accountId) {
        // Get history for a specific account
        result = await transactionService.getAccountHistory({
          accountId: params.accountId,
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
          type: params.type,
          limit: params.limit,
          skip: params.skip,
        });
      } else if (params.userId || session.role !== "user") {
        // Get history for all user accounts
        const userId = params.userId || session.id;
        result = await transactionService.getUserTransactionHistory({
          userId,
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
          limit: params.limit,
          skip: params.skip,
        });
      } else {
        // Admin requesting all transactions
        if (session.role !== "admin" && session.role !== "superadmin") {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }

        result = await transactionService.getAllTransactions({
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
          type: params.type,
          status: params.status,
          limit: params.limit,
          skip: params.skip,
        });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid query parameters", details: error.errors },
          { status: 400 }
        );
      }

      throw error;
    }
  },

  /**
   * Get transaction statistics for a user
   */
  async getStats(req: NextRequest, session: SessionContext) {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");

      // Authorization: Users can only see their own stats
      if (session.role === "user" && userId && userId !== session.id) {
        return NextResponse.json(
          { error: "Unauthorized: You can only view your own statistics" },
          { status: 403 }
        );
      }

      const targetUserId = userId || session.id;

      const stats = await transactionService.getUserTransactionStats(
        targetUserId
      );

      return NextResponse.json(
        {
          userId: targetUserId,
          ...stats,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  },
};
