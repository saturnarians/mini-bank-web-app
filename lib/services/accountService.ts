import { prisma } from "@/lib/prisma";

/**
 * AccountService
 * - Pure data access layer
 * - NO auth logic
 * - NO request objects
 * - Predictable inputs only
 */
export const accountService = {
  /**
   * Create user account
   */
  async create(data: {
    userId: string;
    accountType: string;
    balance?: number;
  }) {
    const accountNumber =
      `ACC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return prisma.account.create({
      data: {
        userId: data.userId,
        accountType: data.accountType,
        accountNumber,
        currency: "USD",
        status: "active",
        balance: data.balance ?? 0,
      },
    });
  },

  /**
   * Fetch account by ID
   * REQUIRED for secure deletes & ownership checks
   */
  async getById(accountId: string) {
    return prisma.account.findUnique({
      where: { id: accountId },
    });
  },

  /**
   * Update allowed account fields only
   * Prevents privilege escalation & data corruption
   */
  async update(
    accountId: string,
    payload: {
      accountType?: string;
      status?: "active" | "suspended";
    },
  ) {
    return prisma.account.update({
      where: { id: accountId },
      data: payload,
    });
  },

  /**
   * Delete account
   * Controller MUST authorize first
   */
  async delete(accountId: string) {
    return prisma.account.delete({
      where: { id: accountId },
    });
  },

  /**
   * Admin-only suspend
   */
  async suspend(accountId: string, reason: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Audit Log
      await tx.accountLog.create({
        data: {
          accountId,
          action: "SUSPENDED",
          reason,
          performedBy: adminId, // ID of the admin from session
        },
      });

      // 2. Update the Account Status
      const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: { status: "suspended" },
    });

    // return updatedAccount;
  });
  },

  /**
   * List user accounts
   * Indexed by userId (critical for scale)
   */
  async listByUser(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 1, // take: 1 => Just get the most recent action
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * List accounts with recent transactions
   * Used for dashboard summary
   */
  async listWithRecentTransactions(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          take: 5,
          orderBy: { timestamp: "desc" }, // ensure schema supports this
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
