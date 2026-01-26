import { prisma } from "@/lib/prisma";

export async function createDailySnapshots() {
  console.log('🚀 Starting daily balance snapshot (Transaction-based)...');
  
  try {
    const accounts = await prisma.account.findMany({
      select: { id: true }
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const snapshotPromises = accounts.map(async (acc) => {
      // Find the most recent transaction for this account
      const lastTx = await prisma.transaction.findFirst({
        where: { accountId: acc.id },
        orderBy: { timestamp: 'desc' },
      });

      // If there are NO transactions ever, use the current account balance (initial state)
      // Otherwise, use the runningBalance from the last transaction.
      const snapshotBalance = lastTx ? lastTx.runningBalance : 0;

      return prisma.balanceSnapshot.upsert({
        where: {
          accountId_date: {
            accountId: acc.id,
            date: today,
          },
        },
        update: { balance: snapshotBalance },
        create: {
          accountId: acc.id,
          balance: snapshotBalance,
          date: today,
        },
      });
    });

    await Promise.all(snapshotPromises);
    console.log(`✅ Snapshots synced with last transaction states.`);
  } catch (error) {
    console.error('❌ Transaction snapshot failed:', error);
  }
}

/**
 *
 * import { prisma } from "@/lib/prisma";

export async function runDailySnapshot(date: Date) {
  const accounts = await prisma.account.findMany();

  for (const account of accounts) {
    const lastTx = await prisma.transaction.findFirst({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });

    await prisma.accountDailySnapshot.upsert({
      where: {
        accountId_date: {
          accountId: account.id,
          date,
        },
      },
      update: {},
      create: {
        accountId: account.id,
        date,
        balance: lastTx?.runningBalance ?? 0,
      },
    });
  }
}

 * 
 */