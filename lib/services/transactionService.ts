import { prisma } from '@/lib/prisma';
import { Prisma, AccountStatus } from '@prisma/client';


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
   * Excludes admin-created historical transaction entries from user view
   */
  async listByUser({
    userId,
    accountId,
    cursor,
    limit = 20,
  }: {
    userId: string;
    accountId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId, // IMPORTANT: user → account → transactions
        },
        // Exclude admin-created historical entries from user view
        ...(accountId ? { accountId } : {}),
        isHistorical: false,
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
    return prisma.$transaction(async  (tx: Prisma.TransactionClient) => {
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
            isHistorical: false,
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
            isHistorical: false,
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
          isHistorical: false,
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
    return prisma.$transaction(async  (tx: Prisma.TransactionClient) => {
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
          isHistorical: true,
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

  /// For external transfer
async createExternalTransfer({
    userId,
    accountId,
    amount,
    recipientBank,
    recipientAccountNumber,
    recipientName,      // ADDED: Real transfers need a name
    swiftCode,          // ADDED: For international
    iban,               // ADDED: For international (Europe/etc)
    routingNumber,      // ADDED: For US transfers
    description,
  }: {
    userId: string;
    accountId: string;
    amount: number;
    recipientBank: string;
    recipientAccountNumber: string;
    recipientName: string;
    swiftCode?: string;
    iban?: string;
    routingNumber?: string;
    description?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Fetch Account AND User details (to get sender's name)
      const senderAccount = await tx.account.findFirst({
        where: { id: accountId, userId },
        include: { user: true } // <--- Key change: We now know who the user is
      });

      if (!senderAccount) throw new Error('ACCOUNT_NOT_FOUND');
      if (senderAccount.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');
      if (senderAccount.balance < amount) throw new Error('INSUFFICIENT_FUNDS');

      // 2. SIMULATE EXTERNAL BANK API CALL
      // In a real app, you would call Stripe, Wise, or a Bank API here.
      // We will pretend that call happened and was successful.
      const externalReferenceId = `REF-${Math.floor(Math.random() * 900000) + 100000}`; // Fake ID from "The Other Bank"
      
      // 3. Deduct Money
      const updatedSender = await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });

      // 4. Create Transaction with FULL Metadata
      const txRecord = await tx.transaction.create({
        data: {
          accountId,
          userId,
          amount,
          type: 'transfer',
          status: 'completed', // admin controls it here 
          description: description || `Transfer to ${recipientName}`,
          runningBalance: updatedSender.balance,
          reference: `EXT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          isHistorical: false ,
          
          // RICH METADATA: This stores the "Receipt" details
          metadata: {
            external: true,
            provider_reference: externalReferenceId, // The fake ID from the "other bank"
            
            // Recipient Details (International)
            recipient: {
                bank_name: recipientBank,
                account_number: recipientAccountNumber,
                account_name: recipientName,
                swift_code: swiftCode || null,
                iban: iban || null,
                routing_number: routingNumber || null,
            },

            // Sender Details (Snapshot of who sent it)
            sender: {
                account_number: senderAccount.accountNumber,
                account_type: senderAccount.accountType,
                name: senderAccount.user.name,
                email: senderAccount.user.email,
            }
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
    status,
    endDate,
    type,
    limit = 50,
    skip = 0,
  }: {
    accountId: string;
    startDate?: Date;
    status?: string;
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

    if (type) where.type = type;
    if (status) where.status =  status;

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
      OR: [
        { userId }, // external/ user-level
        {

        account: {
        userId, // account-level
      },
        },
      ],
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

 // Admin Process External Transfer

async processExternalTransfer({
    adminId,
    transactionId,
    decision, // 'approve' or 'reject'
    rejectionReason
  }: {
    adminId: string;
    transactionId: string;
    decision: 'approve' | 'reject';
    rejectionReason?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Find the transaction
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { account: true } // We need the account to refund money if rejected
      });

      if (!transaction) throw new Error('TRANSACTION_NOT_FOUND');
      if (transaction.status !== 'pending') throw new Error('TRANSACTION_NOT_PENDING');

      // ---------------------------------------------------------
      // SCENARIO A: APPROVE (Money is already gone, just update status)
      // ---------------------------------------------------------
      if (decision === 'approve') {
        const updatedTx = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            updatedAt: new Date(),
          }
        });

        // Log the Admin Action
        await tx.adminActionLog.create({
          data: {
            adminId,
            action: 'approve_transfer',
            targetType: 'transaction',
            targetId: transactionId,
            reason: 'Routine approval',
          }
        });

        return { status: 'APPROVED', transaction: updatedTx };
      }

      // ---------------------------------------------------------
      // SCENARIO B: REJECT (Must REFUND the money)
      // ---------------------------------------------------------
      if (decision === 'reject') {
        if (!rejectionReason) throw new Error('REJECTION_REASON_REQUIRED');

        // 1. Refund the money to the User's Account
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: transaction.amount } }
        });

        // 2. Mark Transaction as Failed
        const updatedTx = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: AccountStatus.failed,
            updatedAt: new Date(),
            metadata: {
              ...(transaction.metadata as object || {}), // Keep existing metadata
              rejection_reason: rejectionReason,
              rejected_by: adminId
            }
          }
        });

        // 3. Log the Admin Action
        await tx.adminActionLog.create({
          data: {
            adminId,
            action: 'reject_transfer',
            targetType: 'transaction',
            targetId: transactionId,
            reason: rejectionReason,
          }
        });

        return { status: 'REJECTED_AND_REFUNDED', transaction: updatedTx };
      }
    });
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

  // async listForAccount({})  {
  // },
}
