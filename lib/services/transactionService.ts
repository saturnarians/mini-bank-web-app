import { prisma } from '@/lib/prisma';

type AdjustBalanceInput = {
  accountId: string;
  amount: number;
  reason: string;
  admin: {
    id: string;
    email: string;
  };
  ipAddress: string;
};

export const transactionService = {
  /**
   * List transactions for a user's account (cursor pagination)
   */
  async listByUser({
    userId,
    cursor,
    limit = 20,
  }: {
    userId: string;
    cursor?: string;
    limit?: number;
  }) {
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId, // IMPORTANT: user → account → transactions
        },
      },

      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),

      take: limit + 1,
      orderBy: { timestamp: 'desc' },
    });

    const hasNextPage = transactions.length > limit;
    const items = hasNextPage
      ? transactions.slice(0, limit)
      : transactions;

    return {
      transactions: items,
      nextCursor: hasNextPage
        ? items[items.length - 1].id
        : null,
    };
  },

  /**
   * User-initiated transaction (send / withdraw / deposit)
   */
 async createUserTransaction({
    userId,
    accountId,
    data,
  }: {
    userId: string;
    accountId: string;
    data: {
      type: 'deposit' | 'withdrawal' | 'transfer';
      amount: number;
      description: string;
      recipientAccountId?: string;
      runningBalance: number;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. verify ownership of the sender
      const sender = await tx.account.findFirst({
        where: { id: accountId, userId },
      });

      if (!sender) throw new Error('ACCOUNT_NOT_FOUND');
      if (sender.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');

      // 2. Basic balance guard
      if ((data.type === 'withdrawal' || data.type === 'transfer') && sender.balance < data.amount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 3. Handle internal transfer (same bank)
      if (data.type === 'transfer') {
        if (!data.recipientAccountId) throw new Error('RECIPIENT_REQUIRED');
        if (data.recipientAccountId === sender.id) throw new Error('CANNOT_TRANSFER_TO_SAME_ACCOUNT');

        const recipient = await tx.account.findUnique({ where: { id: data.recipientAccountId } });
        if (!recipient) throw new Error('RECIPIENT_NOT_FOUND');
        if (recipient.status === 'SUSPENDED') throw new Error('RECIPIENT_SUSPENDED');

        // perform atomic balance updates
        const updatedSender = await tx.account.update({
          where: { id: sender.id },
          data: { balance: { decrement: data.amount } },
        });

        const updatedRecipient = await tx.account.update({
          where: { id: recipient.id },
          data: { balance: { increment: data.amount } },
        });

        // create sender transaction
        const senderTx = await tx.transaction.create({
          data: {
            accountId: sender.id,
            amount: data.amount,
            type: 'transfer',
            description: data.description,
            recipientAccountId: recipient.id,
            status: 'completed',
            timestamp: new Date(),
            userId,
            reference: `TX-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            runningBalance: updatedSender.balance,
          },
        });

        // create recipient transaction (incoming)
        const recipientTx = await tx.transaction.create({
          data: {
            accountId: recipient.id,
            amount: data.amount,
            type: 'transfer',
            description: `Incoming transfer from ${sender.accountNumber ?? sender.id}`,
            recipientAccountId: null,
            status: 'completed',
            timestamp: new Date(),
            userId: recipient.userId,
            reference: `TX-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            runningBalance: updatedRecipient.balance,
          },
        });

        return { senderTx, recipientTx };
      }

      // 4. Non-transfer flows: deposit / withdrawal (existing behaviour)
      const txRecord = await tx.transaction.create({
        data: {
          accountId: sender.id,
          amount: data.amount,
          type: data.type,
          description: data.description,
          recipientAccountId: data.recipientAccountId,
          status: 'completed',
          timestamp: new Date(),
          userId,
          reference: `TX-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          runningBalance: data.runningBalance,
        },
      });

      if (data.type === 'deposit') {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { increment: data.amount } } });
      } else if (data.type === 'withdrawal') {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { decrement: data.amount } } });
      }

      return txRecord;
    });
  },

  /**
   * Admin balance adjustment (append-only ledger entry)
   */
  async adminAdjustBalance({ accountId, amount, reason, admin, ipAddress }: AdjustBalanceInput) {

    if (!reason || reason.trim().length < 5) {
      throw new Error("Adjustment reason is required");
    }

    // Perform the balance mutation and insertion of the adjustment transaction
    // inside a single database transaction to avoid races.
    return prisma.$transaction(async (tx) => {
      // 1) Ensure account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error('ACCOUNT_NOT_FOUND');

      // 2) Atomically increment the account balance and obtain the new value
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      });

      const newBalance = updatedAccount.balance;

      // 3) Create an append-only transaction record reflecting the admin adjustment
      const txRecord = await tx.transaction.create({
        data: {
          accountId: accountId,
          userId: null,
          amount: amount,
          type: "adjustment",
          status: "completed",
          reference: `ADMIN-ADJ-${Date.now()}`,
          timestamp: new Date(),
          description: "Admin adjustment",
          reason: reason,
          runningBalance: newBalance,
          metadata: {
            adjustedByAdminId: admin.id,
            adjustedByAdminEmail: admin.email,
            ipAddress: ipAddress,
          },
        },
      });

      return txRecord;
    });
  },

  async createExternalTransfer({
    userId,
    accountId,
    amount,
    recipientBank,
    recipientAccountNumber,
    description,
  }: {
    userId: string;
    accountId: string;
    amount: number;
    recipientBank: string;
    recipientAccountNumber: string;
    description?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({ where: { id: accountId, userId } });
      if (!account) throw new Error('ACCOUNT_NOT_FOUND');
      if (account.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');
      if (account.balance < amount) throw new Error('INSUFFICIENT_FUNDS');

      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          accountId,
          userId,
          amount,
          type: 'transfer',
          status: 'completed',
          description: description || 'External transfer',
          runningBalance: updated.balance,
          reference: `EXT-${Date.now()}-${Math.floor(Math.random()*1000000)}`,
          metadata: {
            external: true,
            recipientBank,
            recipientAccountNumber,
          },
          timestamp: new Date(),
        },
      });

      return txRecord;
    });
  },

  // List all accounts with counterParty deliver //Transaction History Parser

  /**
   * Get transaction history for an account
   * Can be filtered by date range and transaction type
   */
  async getAccountHistory({
    accountId,
    startDate,
    endDate,
    type,
    limit = 50,
    skip = 0,
  }: {
    accountId: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    limit?: number;
    skip?: number;
  }) {
    const where: any = { accountId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Get transaction history across all user's accounts
   * Admin can view any user's history
   */
  async getUserTransactionHistory({
    userId,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
  }: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }) {
    const where: any = {
      account: {
        userId,
      },
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              accountType: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Get all transactions (admin view)
   */
  async getAllTransactions({
    startDate,
    endDate,
    type,
    status,
    limit = 50,
    skip = 0,
  }: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }) {
    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              accountType: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Get transaction statistics for a user
   */
  async getUserTransactionStats(userId: string) {
    const [totalCount, totalAmount, byType] = await Promise.all([
      prisma.transaction.count({
        where: {
          account: { userId },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          account: { userId },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          account: { userId },
        },
        _count: true,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalCount,
      totalAmount: totalAmount._sum.amount ?? 0,
      byType,
    };
  },
}