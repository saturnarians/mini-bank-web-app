import { prisma } from "@/lib/prisma";

/**
 * AccountService
 * - Pure data access layer
 * - NO auth logic
 * - NO request objects
 * - Predictable inputs only
 */

  type AccountType = "checking" | "savings" | "investment";

export const accountService = {
  /**
   * Create user account
   */
  async create(data: {
    userId: string;
    accountType?: AccountType;
    balance?: number;
  }) {
    
    const accountNumber =
      `ACC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return prisma.account.create({
      data: {
        userId: data.userId,
        accountType: data.accountType || "savings",
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
      include: {
        user: true,
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  },

  /**
   * Update allowed account fields only
   * Prevents privilege escalation & data corruption
   */
  async update(
    accountId: string,
    payload: {
      accountType?: AccountType;
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
   * Admin-only suspend account
   */
  async suspend(accountId: string, reason: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error("ACCOUNT_NOT_FOUND");

      // 2. Create the Audit Log
      await tx.accountLog.create({
        data: {
          accountId,
          action: "suspended",
          reason,
          performedBy: adminId,
        },
      });

      // 3. Create admin action log
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "suspend_account",
          targetType: "account",
          targetId: accountId,
          reason,
          metadata: { previousStatus: account.status },
        },
      });

      // 4. Update the Account Status
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { status: "suspended" },
      });

      return updated;
    });
  },

  /**
   * Admin-only resume account
   */
  async resume(accountId: string, reason: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error("ACCOUNT_NOT_FOUND");

      // 2. If already active, no-op
      if (account.status === "active") return account;

      // 3. Create the Audit Log
      await tx.accountLog.create({
        data: {
          accountId,
          action: "resumed",
          reason,
          performedBy: adminId,
        },
      });

      // 4. Create admin action log
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "resume_account",
          targetType: "account",
          targetId: accountId,
          reason,
          metadata: { previousStatus: account.status },
        },
      });

      // 5. Update the Account Status
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { status: "active" },
      });

      return updated;
    });
  },

  /**
   * Admin-only create/set initial balance for account
   */
  async createBalance(
    accountId: string,
    balance: number,
    reason: string,
    adminId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error("ACCOUNT_NOT_FOUND");

      const previousBalance = account.balance;
      const difference = balance - previousBalance;

      // 2. Update account balance
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance },
      });

      // 3. Create transaction record for audit trail
      await tx.transaction.create({
        data: {
          accountId,
          userId: account.userId,
          type: "adjustment",
          amount: difference,
          runningBalance: balance,
          description: `Admin Balance Creation/Adjustment: ${reason}`,
          status: "completed",
          reference: `ADM-${Date.now()}`,
          reason,
          metadata: {
            previousBalance,
            newBalance: balance,
            adminId,
          },
        },
      });

      // 4. Create admin action log
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: "create_balance",
          targetType: "account",
          targetId: accountId,
          reason,
          metadata: {
            previousBalance,
            newBalance: balance,
            difference,
          },
        },
      });

      return updated;
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
          take: 1,
        },
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
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get all accounts (admin view)
   */
  async listAll(
    options?: {
      skip?: number;
      take?: number;
      status?: string;
    }
  ) {
    return prisma.account.findMany({
      where: options?.status ? { status: options.status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        logs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    });
  },
};
