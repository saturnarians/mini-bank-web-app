import { prisma } from "@/lib/prisma";

export const transactionService = {
  /**
   * Cursor-based transaction pagination
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
      where: { userId },

      // Cursor logic
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // important: skip the cursor itself
      }),

      take: limit + 1, // fetch one extra to detect next page
      orderBy: { timestamp: "desc" },
    });

    const hasNextPage = transactions.length > limit;
    const items = hasNextPage
      ? transactions.slice(0, limit)
      : transactions;

    return {
      items,
      nextCursor: hasNextPage
        ? items[items.length - 1].id
        : null,
    };
  },
};
