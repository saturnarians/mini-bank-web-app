import { accountService } from "../services/accountService";
import { createAccountSchema, updateAccountSchema, suspendAccountSchema } from "../schemas";

export const accountController = {
  async create(reqUserId: string, body: any) {
    const validatedData = createAccountSchema.parse(body);
    return accountService.create({ 
      userId: reqUserId, 
      accountType: validatedData.accountType, 
      balance: validatedData.initialBalance 
    });
  },

  async update(accountId: string, body: any) {
    const validatedData = updateAccountSchema.parse(body);
    return accountService.update(accountId, validatedData);
  },

  async delete(accountId: string, session: any) {
    const account = await accountService.getById(accountId);
    
    if (!account) throw new Error("Account not found");

    // Security: Only allow owner or admin to delete
    if (session.role !== 'admin' && account.userId !== session.id) {
      throw new Error("Unauthorized to delete this account");
    }

    return await accountService.delete(accountId);
  },

  async suspend(accountId: string) {
    return accountService.suspend(accountId);
  },

  async list(reqUserId: string) {
    return accountService.getUserAccounts(reqUserId);
  },

  async list2(reqUserId: string) {
    return accountService.getWithTransactions(reqUserId);
  }

};
