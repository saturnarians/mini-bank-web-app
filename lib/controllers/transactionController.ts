import { transactionService } from "@/lib/services/transactionService";

export const transactionController = {
  async list(
    session: { id: string },
    query: { cursor?: string; limit?: string },
  ) {
    return transactionService.listByUser({
      userId: session.id,
      cursor: query.cursor,
      limit: query.limit ? Number(query.limit) : 20,
    });
  },
};
