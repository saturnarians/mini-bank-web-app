import { NextRequest, NextResponse } from "next/server";
import { accountService } from "@/lib/services/accountService";
import { z } from "zod";

interface AdminContext {
  id: string;
  email: string;
  name?: string;
}

// Schemas for validation
const suspendAccountSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const resumeAccountSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const createBalanceSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  balance: z.number().min(0, "Balance must be non-negative"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const adminAccountController = {
  /**
   * Suspend an account
   */
  async suspendAccount(req: NextRequest, admin: AdminContext) {
    try {
      const body = await req.json();
      const { accountId, reason } = suspendAccountSchema.parse(body);

      // Verify account exists and get details
      const account = await accountService.getById(accountId);
      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      // Check if already suspended
      if (account.status === "suspended") {
        return NextResponse.json(
          { error: "Account is already suspended" },
          { status: 400 }
        );
      }

      // Suspend the account
      const result = await accountService.suspend(accountId, reason, admin.id);

      return NextResponse.json(
        {
          message: "Account suspended successfully",
          accountId,
          newStatus: "suspended",
          suspendedBy: admin.email,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "ACCOUNT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      throw error;
    }
  },

  /**
   * Resume a suspended account
   */
  async resumeAccount(req: NextRequest, admin: AdminContext) {
    try {
      const body = await req.json();
      const { accountId, reason } = resumeAccountSchema.parse(body);

      // Verify account exists
      const account = await accountService.getById(accountId);
      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      // Check if already active
      if (account.status === "active") {
        return NextResponse.json(
          { error: "Account is already active" },
          { status: 400 }
        );
      }

      // Resume the account
      await accountService.resume(accountId, reason, admin.id);

      return NextResponse.json(
        {
          message: "Account resumed successfully",
          accountId,
          newStatus: "active",
          resumedBy: admin.email,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "ACCOUNT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      throw error;
    }
  },

  /**
   * Create or set initial balance for an account
   */
  async createBalance(req: NextRequest, admin: AdminContext) {
    try {
      const body = await req.json();
      const { accountId, balance, reason } = createBalanceSchema.parse(body);

      // Verify account exists
      const account = await accountService.getById(accountId);
      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      const previousBalance = account.balance;

      // Create/set balance
      const result = await accountService.createBalance(
        accountId,
        balance,
        reason,
        admin.id
      );

      return NextResponse.json(
        {
          message: "Balance created/updated successfully",
          accountId,
          previousBalance,
          newBalance: balance,
          difference: balance - previousBalance,
          createdBy: admin.email,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "ACCOUNT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      throw error;
    }
  },
};
