import { transactionService } from '@/lib/services/transactionService';
import { createTransactionSchema, adminAdjustBalanceSchema } from '@/lib/schemas';
import { CreateTransactionPayload } from '@/lib/types';
import { z } from 'zod';


export const transactionController = {

  async list(
    session: { id: string },
    query: { accountId?: string; cursor?: string; limit?: string }
  ) {
    return transactionService.listByUser({
      userId: session.id,
      accountId: query.accountId,
      cursor: query.cursor,
      limit: query.limit ? Number(query.limit) : 20,
    });
  },

//   async listAll(req: Request, session: { id: string }) {
//   const accountId = req.query.accountId as string;
//   const include = req.query.include as string | undefined;

//   return transactionService.listForAccount({
//     accountId,
//     userId: session.id,
//     includeCounterparty: include === 'counterparty',
//   });
// },


  async createUserTransaction({
    session,
    accountId,
    body,
  }: {
    session: { id: string; role: string };
    accountId: string;
    body: unknown;
  }) {

    // Validate user intent
    const data = createTransactionSchema.parse(body);
    const { pin: _pin, ...txData } = data;

    return transactionService.createUserTransaction({
      userId: session.id,
      accountId: accountId,
      data: txData,
    });
  },

  

  async adminAdjustBalance({ 
      admin,
      ipAddress,
      body,
    } : {
    admin:{id:string; email:string;};
    ipAddress: string;
    body: unknown;
  }) {

    const data = adminAdjustBalanceSchema.parse(body);

    return transactionService.adminAdjustBalance({
      admin: admin,
      ipAddress: ipAddress ,
      ...data,
    }
    );
  },
};

