import { prisma } from "@/lib/prisma";
  // the data and payload shouldn't give any
export const accountService = {
  // USER: Create account

  // userId: session.id,
  async create(data:{ userId: string, accountType: string, balance?: number}) {
    const accountNumber = `ACC${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    return prisma.account.create({
        data: {
        ...data,
        accountNumber,
        currency: 'USD',
        status: 'active',
        balance: data.balance ?? 0,
      },
    });
  },

  // USER + ADMIN: Update account
  async update(accountId: string, payload: any) {
    return prisma.account.update({
      where: { id: accountId },
      data: payload,
    });
  },

  async delete(accountId: string) {
    return prisma.account.delete({
      where: { id: accountId },
    });
  },

  // async getById(accountId: string) {
  //   return prisma.account.findUnique({ where: { id: accountId } });
  // },

  // ADMIN: Suspend account
  async suspend(accountId: string) {
    return prisma.account.update({
      where: { id: accountId },
      data: { status: "suspended" },
    });
  },

  async getUserAccounts(userId: string) {
    return prisma.account.findMany({ where: { userId } });
  },

  async getWithTransactions(userId: string) {
      return prisma.account.findMany({
        where: { userId },
        include: {
          transactions: {
            take: 5,
            orderBy: { timestamp: 'desc' },
          },
        },
      });
    }
};


