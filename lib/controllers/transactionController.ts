import { transactionService } from "../services/transactionService";
import { accountService } from "../services/accountService";
import { z } from "zod";
import { transactionSchema } from "../schemas";

export const transactionController = {
  async create(userId: string, body: any) {
    // 1. Validate body
    const data = transactionSchema.parse(body);

    // 2. Verify account ownership
    const account = await accountService.getById(data.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    // 3. Generate Reference
    const reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    return await transactionService.executeTransaction(userId, { ...data, reference });
  }
};