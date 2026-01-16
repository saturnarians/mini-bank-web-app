import { prisma } from '../prisma';

export const adminController = {
  async adjustUserBalance(adminId: string, targetAccountId: string, newAmount: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get current balance to calculate the difference for the log
      const currentAccount = await tx.account.findUnique({ where: { id: targetAccountId } });
      if (!currentAccount) throw new Error("Account not found");

      // 2. Update balance
      const updated = await tx.account.update({
        where: { id: targetAccountId },
        data: { balance: newAmount }
      });

      // 3. Log the Admin action as a transaction
      await tx.transaction.create({
        data: {
          accountId: targetAccountId,
          userId: currentAccount.userId,
          type: 'deposit', // or 'adjustment' if your enum supports it
          amount: newAmount - currentAccount.balance, // The difference
          description: `Admin Adjustment (Admin ID: ${adminId})`,
          status: 'completed',
          reference: `ADM${Date.now()}`
        }
      });

      return updated;
    });
  }
};