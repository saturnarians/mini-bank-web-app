import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/lib/auth';
import type { User, AccountStatus } from '@/lib/types';

// Helper function to generate account number
function generateAccountNumber() {
  return `AC${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

function normalizeUserStatus(status?: string | null): 'active' | 'suspended' {
  return (status ?? '').trim().toLowerCase() === 'suspended'
    ? 'suspended'
    : 'active';
}

export const authService = {
  async register(data: {
    email: string;
    name: string;
    password: string;
    transactionPin?: string;
    accountType?: 'checking' | 'savings' | 'investment';
  }): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const hashedTransactionPin = data.transactionPin
      ? await bcrypt.hash(data.transactionPin, 10)
      : null;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          transactionPinHash: hashedTransactionPin,
          transactionPinSetAt: hashedTransactionPin ? new Date() : null,
          role: 'user',
          emailVerified: false,
        },
      });

      const account = await tx.account.create({
        data: {
          userId: user.id,
          accountType: data.accountType || 'checking',
          accountNumber: generateAccountNumber(),
          currency: 'USD',
          status: 'active',
        },
      });

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: 100 } },
      });

      await tx.transaction.create({
        data: {
          accountId: account.id,
          amount: 100,
          type: 'deposit',
          status: 'completed',
          description: 'Welcome Bonus',
          runningBalance: updatedAccount.balance,
          reference: `REG-BONUS-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
          metadata: {
            source: 'registration_bonus',
            invariant: 'SYSTEM_CREDIT_ONLY',
          },
        },
      });

      return { user, account: updatedAccount };
    });

    const { user, account } = result;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: normalizeUserStatus(user.status),
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified,
      hasTransactionPin: !!user.transactionPinHash,
      accounts: [
        {
          id: account.id,
          userId: account.userId,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          currency: 'USD',
          status: 'active' as AccountStatus,
          createdAt: account.createdAt.toISOString(),
          balance: account.balance,
        },
      ],
    };
  },

  async login(data: { email: string; password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error('INVALID_CREDENTIALS');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: normalizeUserStatus(user.status),
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified,
      hasTransactionPin: !!user.transactionPinHash,
    };
  },
};
