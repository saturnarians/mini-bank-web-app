import prisma from '@/lib/prisma';

export const transactionService = {
  async executeTransaction(userId: string, data: any) {
    const { accountId, type, amount, description, recipientAccountId, reference } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Create the Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          accountId,
          userId,
          type,
          amount,
          description,
          recipientAccountId,
          reference,
          status: 'completed',
          currency: 'USD',
        },
      });

      // 2. Update the balance based on type
      const balanceChange = type === 'deposit' ? { increment: amount } : { decrement: amount };

      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { 
          balance: balanceChange,
          lastTransactionAt: new Date()
        },
      });

      // 3. Safety Check: Prevent overdrafts on withdrawals/transfers
      if (type !== 'deposit' && updatedAccount.balance < 0) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 4. Handle Transfer (Optional: Increment the recipient's balance)
      if (type === 'transfer' && recipientAccountId) {
        await tx.account.update({
          where: { id: recipientAccountId },
          data: { balance: { increment: amount } },
        });
      }

      return transaction;
    });
  },

  async listUserTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async executeTransfer(senderAccountId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Fetch the sender's account first to check their current balance
      const account = await tx.account.findUnique({
        where: { id: senderAccountId }
      });

      if (!account) throw new Error("ACCOUNT_NOT_FOUND");

      // THE ENFORCEMENT CONNECTION
      if (account.status === 'suspended') {
        throw new Error("TRANSACTION_DENIED: Account is suspended");
      }
      
      if (account.status === 'closed') {
        throw new Error("TRANSACTION_DENIED: Account is closed");
      }

      // 2. THE CHECK GOES HERE
      // Even if the user tries to send $0.01, if they have $0.00, this stops them.
      if (account.balance < amount) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // 3. Proceed with the reduction
      return await tx.account.update({
        where: { id: senderAccountId },
        data: {
          balance: { decrement: amount }
        }
      });
    });
  }
};