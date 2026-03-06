import { prisma } from '@/lib/prisma';
import { Prisma, AccountStatus } from '@prisma/client';

const isSuspended = (status?: string | null) =>
  (status ?? "").trim().toLowerCase() === "suspended";

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
   * Includes ledger and historical/admin-inserted entries
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
        ...(accountId ? { accountId } : {}),
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
      runningBalance?: number;
    };
  }) {
    console.log("[Service][tx.createUserTransaction] start", {
      userId,
      accountId,
      type: data.type,
      amount: data.amount,
    });

    if (!accountId) {
      console.error("[Service][tx.createUserTransaction] missing accountId", { userId });
      throw new Error('ACCOUNT_ID_REQUIRED');
    }

    return prisma.$transaction(async  (tx: Prisma.TransactionClient) => {
      const senderUser = await tx.user.findUnique({
        where: { id: userId },
        select: { status: true },
      });

      if (!senderUser) {
        console.error("[Service][tx.createUserTransaction] sender user not found", { userId });
        throw new Error("USER_NOT_FOUND");
      }
      if (isSuspended(senderUser.status)) {
        console.error("[Service][tx.createUserTransaction] blocked user suspended", {
          userId,
          status: senderUser.status,
        });
        throw new Error("USER_SUSPENDED");
      }

      // 1. verify ownership of the sender
      const sender = await tx.account.findFirst({
        where: { id: accountId, userId },
      });

      if (!sender) {
        console.error("[Service][tx.createUserTransaction] sender account not found", {
          userId,
          accountId,
        });
        throw new Error('ACCOUNT_NOT_FOUND');
      }
      if (isSuspended(sender.status)) {
        console.error("[Service][tx.createUserTransaction] blocked account suspended", {
          accountId: sender.id,
          status: sender.status,
        });
        throw new Error('ACCOUNT_SUSPENDED');
      }

      // 2. Basic balance guard
      if ((data.type === 'withdrawal' || data.type === 'transfer') && sender.balance < data.amount) {
        console.error("[Service][tx.createUserTransaction] insufficient funds", {
          accountId: sender.id,
          balance: sender.balance,
          amount: data.amount,
        });
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 3. Handle internal transfer (same bank)
      if (data.type === 'transfer') {
        if (!data.recipientAccountId) {
          console.error("[Service][tx.createUserTransaction] recipient required", {
            accountId: sender.id,
          });
          throw new Error('RECIPIENT_REQUIRED');
        }
        if (data.recipientAccountId === sender.id) {
          console.error("[Service][tx.createUserTransaction] same-account transfer blocked", {
            accountId: sender.id,
          });
          throw new Error('CANNOT_TRANSFER_TO_SAME_ACCOUNT');
        }

        const recipient = await tx.account.findUnique({ where: { id: data.recipientAccountId } });
        if (!recipient) {
          console.error("[Service][tx.createUserTransaction] recipient not found", {
            recipientAccountId: data.recipientAccountId,
          });
          throw new Error('RECIPIENT_NOT_FOUND');
        }
        if (isSuspended(recipient.status)) {
          console.error("[Service][tx.createUserTransaction] recipient suspended", {
            recipientAccountId: recipient.id,
            status: recipient.status,
          });
          throw new Error('RECIPIENT_SUSPENDED');
        }

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

        console.log("[Service][tx.createUserTransaction] transfer completed", {
          senderAccountId: sender.id,
          recipientAccountId: recipient.id,
          amount: data.amount,
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
          runningBalance:
            data.runningBalance ??
            (data.type === 'deposit'
              ? sender.balance + data.amount
              : sender.balance - data.amount),
          isHistorical: false,
        },
      });

      if (data.type === 'deposit') {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { increment: data.amount } } });
      } else if (data.type === 'withdrawal') {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { decrement: data.amount } } });
      }

      console.log("[Service][tx.createUserTransaction] non-transfer completed", {
        accountId: sender.id,
        type: data.type,
        amount: data.amount,
      });
      return txRecord;
    });
  },

  /**
   * Admin balance adjustment (append-only ledger entry)
   */
  async adminAdjustBalance({ accountId, amount, reason, admin, ipAddress }: AdjustBalanceInput) {
    console.log("[Service][tx.adminAdjustBalance] start", {
      accountId,
      amount,
      adminId: admin.id,
      ipAddress,
    });

    if (!reason || reason.trim().length < 5) {
      console.error("[Service][tx.adminAdjustBalance] invalid reason", { accountId });
      throw new Error("Adjustment reason is required");
    }

    // Perform the balance mutation and insertion of the adjustment transaction
    // inside a single database transaction to avoid races.
    return prisma.$transaction(async  (tx: Prisma.TransactionClient) => {
      // 1) Ensure account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) {
        console.error("[Service][tx.adminAdjustBalance] account not found", { accountId });
        throw new Error('ACCOUNT_NOT_FOUND');
      }

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

      console.log("[Service][tx.adminAdjustBalance] completed", {
        accountId,
        newBalance,
        amount,
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
    console.log("[Service][tx.createExternalTransfer] start", {
      userId,
      accountId,
      amount,
      recipientBank,
    });

    if (!accountId) {
      console.error("[Service][tx.createExternalTransfer] missing accountId", { userId });
      throw new Error('ACCOUNT_ID_REQUIRED');
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Fetch Account AND User details (to get sender's name)
      const senderAccount = await tx.account.findFirst({
        where: { id: accountId, userId },
        include: { user: true } // <--- Key change: We now know who the user is
      });

      if (!senderAccount) {
        console.error("[Service][tx.createExternalTransfer] sender account not found", {
          userId,
          accountId,
        });
        throw new Error('ACCOUNT_NOT_FOUND');
      }
      if (isSuspended(senderAccount.user?.status)) {
        console.error("[Service][tx.createExternalTransfer] blocked user suspended", {
          userId,
          status: senderAccount.user?.status,
        });
        throw new Error("USER_SUSPENDED");
      }
      if (isSuspended(senderAccount.status)) {
        console.error("[Service][tx.createExternalTransfer] blocked account suspended", {
          accountId,
          status: senderAccount.status,
        });
        throw new Error('ACCOUNT_SUSPENDED');
      }
      if (senderAccount.balance < amount) {
        console.error("[Service][tx.createExternalTransfer] insufficient funds", {
          accountId,
          balance: senderAccount.balance,
          amount,
        });
        throw new Error('INSUFFICIENT_FUNDS');
      }

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
      console.log("[Service][tx.createExternalTransfer] completed", {
        accountId,
        amount,
        reference: txRecord.reference,
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
            status: AccountStatus.closed,
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
