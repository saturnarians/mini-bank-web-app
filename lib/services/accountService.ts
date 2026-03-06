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

  async getByIdLite(accountId: string) {
    return prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        userId: true,
        status: true,
        balance: true,
        accountNumber: true,
        accountType: true,
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
    console.log("[Service][account.suspend] start", { accountId, adminId });
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      console.error("[Service][account.suspend] account not found", { accountId });
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: { status: "suspended" },
    });
    console.log("[Service][account.suspend] account updated", {
      accountId,
      previousStatus: account.status,
      newStatus: updated.status,
    });

    await prisma.accountLog.create({
      data: {
        accountId,
        action: "suspended",
        reason,
        performedBy: adminId,
      },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: "suspend_account",
        targetType: "account",
        targetId: accountId,
        reason,
        metadata: { previousStatus: account.status },
      },
    });

    console.log("[Service][account.suspend] completed", { accountId, adminId });
    return updated;
  },

  /**
   * Admin-only resume account
   */
  async resume(accountId: string, reason: string, adminId: string) {
    console.log("[Service][account.resume] start", { accountId, adminId });
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      console.error("[Service][account.resume] account not found", { accountId });
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    // If already active, no-op
    if (account.status === "active") {
      console.log("[Service][account.resume] no-op already active", { accountId });
      return account as any;
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: { status: "active" },
    });

    await prisma.accountLog.create({
      data: {
        accountId,
        action: "resumed",
        reason,
        performedBy: adminId,
      },
    });

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: "resume_account",
        targetType: "account",
        targetId: accountId,
        reason,
        metadata: { previousStatus: account.status },
      },
    });

    console.log("[Service][account.resume] completed", {
      accountId,
      previousStatus: account.status,
      newStatus: updated.status,
    });
    return updated;
  },

  /**
   * Admin-only create/set initial balance for account
   */
  async createBalance(
    accountId: string,
    balance: number,
    reason: string,
    adminId: string,
  ) {
    console.log("[Service][account.createBalance] start", {
      accountId,
      adminId,
      targetBalance: balance,
    });
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      console.error("[Service][account.createBalance] account not found", { accountId });
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const previousBalance = account.balance;
    const difference = balance - previousBalance;

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: { balance },
    });

    await prisma.transaction.create({
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

    await prisma.adminActionLog.create({
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

    console.log("[Service][account.createBalance] completed", {
      accountId,
      previousBalance,
      newBalance: balance,
      difference,
    });
    return updated;
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
    },
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
