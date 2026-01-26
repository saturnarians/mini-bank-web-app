import { accountService } from "@/lib/services/accountService";
import {
  createAccountSchema,
  updateAccountSchema,
  suspendAccountSchema,
  adminAdjustBalanceSchema,
} from "@/lib/schemas";
import { assertAdmin } from "@/lib/auth/auth-utils";
import { transactionService } from "@/lib/services/transactionService";
/**
 * AccountController
 * - Handles validation
 * - Handles authorization
 * - Calls service layer safely
 */
export const accountController = {
  /**
   * Create account (USER)
   */
  async create(session: {
    id: string;
  }, body: unknown) {
    const data = createAccountSchema.parse(body);

    return accountService.create({
      userId: session.id,
      accountType: data.accountType,
      balance: data.initialBalance,
    });
  },

  /**
   * Update account (OWNER or ADMIN)
   */
  async update(
    accountId: string,
    session: { id: string; role: string },
    body: unknown,
  ) {
    const payload = updateAccountSchema.parse(body);
    const account = await accountService.getById(accountId);

    if (!account) throw new Error("ACCOUNT_NOT_FOUND");

    if (
      session.role !== "admin" &&
      account.userId !== session.id
    ) {
      throw new Error("FORBIDDEN");
    }

    return accountService.update(accountId, payload);
  },

  /**
   * Delete account (OWNER or ADMIN)
   */
  async delete(
    accountId: string,
    session: { id: string; role: string },
  ) {
    const account = await accountService.getById(accountId);

    if (!account) throw new Error("ACCOUNT_NOT_FOUND");

    if (
      session.role !== "admin" &&
      account.userId !== session.id
    ) {
      throw new Error("FORBIDDEN");
    }

    return accountService.delete(accountId);
  },

  /**
   * Suspend account (ADMIN ONLY)
   */
  async suspend(
    accountId: string,
    session: { id: string, role: string },
    body: unknown, 
  ) {

    // Use your helper instead of manual if-check
    assertAdmin(session);


    // 1. Double-check Role (Internal guard)
    if (session.role !== "admin" && session.role !== "superadmin") {
      throw new Error("FORBIDDEN");
    }
 
    // 2. Validate the body (extract reason)
    const { reason } = suspendAccountSchema.parse(body);
    
    if (!reason || reason.length < 3) {
      throw new Error("INVALID_REASON");
    }

    // 3. Call the service to suspend and the validated reason
    return accountService.suspend(accountId, reason, session.id);
  },

  // Resume account
  async resume(
    accountId: string,
    session: { id: string, role: string },
    body: unknown,
  ) {
    if (session.role !== "admin" && session.role !== "superadmin") {
      throw new Error("FORBIDDEN");
    }

    const { reason } = suspendAccountSchema.parse(body);

    if (!reason || reason.length < 3) {
      throw new Error("INVALID_REASON");
    }

    return accountService.resume(accountId, reason, session.id);
  },

  /**
   * List accounts for dashboard
   */
  async list(session: { id: string }) {
    return accountService.listByUser(session.id);
  },

//   async list(
//   session: { id: string; role: string },
//   query: GetAccountsParams
// ) {
//   if (query.includeSuspended) {
//     assertAdmin(session);
//   }

//   return accountService.listByUser({
//     userId: session.id,
//     role: session.role,
//     filters: query,
//   });
// },


  /**
   * Dashboard summary view
   */
  async listWithTransactions(session: { id: string }) {
    return accountService.listWithRecentTransactions(session.id);
  },

  async adjustBalance(
  accountId: string,
  session: { id: string; role: string },
  body: unknown
) {
  assertAdmin(session);

  const data = adminAdjustBalanceSchema.parse(body);
  // { amount, reason, direction }

  return transactionService.adminAdjustBalance({
    accountId,
    adminId: session.id,
    input: data,
  });
},

};

