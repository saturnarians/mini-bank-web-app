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

      // 1. verify ownership
      const account = await tx.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
        // lock: { mode: 'ForUpdate' }, // 🔐 critical for balance safety
      });

      if (!account) throw new Error('ACCOUNT_NOT_FOUND');
      if (account.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');
      // if (!account.transactionsEnabled) throw new Error('TRANSACTIONS_DISABLED');

      //2. apply domain rules 
      if (
        (data.type === 'withdrawal' || data.type === 'transfer') &&
        account.balance < data.amount
      ) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // create transaction
      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          amount: data.amount,
          type: data.type,
          description: data.description,
          recipientAccountId: data.recipientAccountId,
          status: 'completed',
          timestamp: new Date(),
          userId,
          reference: `TX-${Date.now()}`,
          runningBalance: data.runningBalance,
        },
      });

      // Balance mutation
      if (data.type === 'deposit') {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: data.amount } },
        });
      } else {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: data.amount } },
        });
      }

      return transaction;
    });
  },

  /**
   * Admin balance adjustment (append-only ledger entry)
   */
  async adminAdjustBalance({
  accountId,
  amount,
  reason,
  admin,
  ipAddress,
  }: AdjustBalanceInput) {

    if (!reason || reason.trim().length < 5) {
      throw new Error("Adjustment reason is required");
    }
    
    const lastTx = await prisma.transaction.findFirst({
      where: { id: accountId },
      orderBy: { timestamp: "desc" },
    });

    const previousBalance = lastTx?.runningBalance ?? 0;
    const newBalance = previousBalance + amount;

    return prisma.transaction.create({
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
  },

  // List all accounts with counterParty deliver //Transaction History Parser

//   async listForAccount({
//   accountId,
//   userId,
//   includeCounterparty,
// }: {
//   accountId: string;
//   userId: string;
//   includeCounterparty?: boolean;
// }) {
//   const transactions = await prisma.transaction.findMany({
//     where: {
//       OR: [
//         { accountId },
//         { recipientAccountId: accountId },
//       ],
//     },
//     orderBy: { description: 'desc' }, // i saw CreatedAt  before
//     include: includeCounterparty
//       ? {
//           account: true,
//           recipientAccount: true,
//         }
//       : undefined,
//   });

//   return transactions.map((tx) => {
//     const isOutgoing = tx.accountId === accountId;

//     return {
//       id: tx.id,
//       type: tx.type,
//       amount: tx.amount,
//       description: tx.description,
//       status: tx.status,
//       timestamp: tx.timestamp.toISOString(),

//       direction: isOutgoing ? 'out' : 'in',

//       counterparty: includeCounterparty
//         ? isOutgoing
//           ? tx.recipientAccount && {
//               accountId: tx.recipientAccount.id,
//               accountNumber: tx.recipientAccount.accountNumber,
//               accountType: tx.recipientAccount.accountType,
//             }
//           : tx.account && {
//               accountId: tx.account.id,
//               accountNumber: tx.account.accountNumber,
//               accountType: tx.account.accountType,
//             }
//         : undefined,
//     };
//   });
// },

};
