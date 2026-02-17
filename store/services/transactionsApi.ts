import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Transaction, CreateTransactionPayload } from '@/lib/types';
import type { TransactionFormData } from '@/lib/schemas';
import { computeBalance } from '@/lib/domain/ledger/computeBalance';

// Helper to build optimistic transaction
function buildOptimisticTransaction(
  body: TransactionFormData & { accountId: string }
): Transaction {
  return {
    id: `temp-${Date.now()}`,
    amount: body.amount,
    type: body.type, // deposit | withdrawal
    status: 'pending',
    reference: 'PENDING',
    currency: 'USD',
    timestamp: new Date().toISOString(),
    description: body.description,
    accountId: body.accountId,
    recipientAccountId: body.recipientAccountId,
    runningBalance: body.runningBalance || 0,
    direction: body.type === 'deposit' ? 'in' : 'out',
  };
}

/* ----------------API-------------------*/

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Transaction', 'Account'],
  endpoints: (builder) => ({

    //-------------- QUERY Fetch transactions (all accounts or per account)
    getTransactions: builder.query<
      { transactions: Transaction[]; nextCursor: string | null },
      { accountId?: string; cursor?: string | null } | void
    >({
      query: (args) => {
        const accountId = args?.accountId;
        const cursor = args?.cursor;

        return {
          url: '/transactions',
          params: {
            ...(accountId ? { accountId } : {}),
            ...(cursor ? { cursor } : {}),
          },
        };
      },
      providesTags: (result, err, args) => {
        const accountId = args?.accountId;

        if (!result) {
          return [
            { type: 'Transaction' as const, id: 'LIST_ALL' },
            ...(accountId ? [{ type: 'Transaction' as const, id: `LIST_${accountId}` }] : []),
          ];
        }

        return [
          ...result.transactions.map((tx) => ({
            type: 'Transaction' as const,
            id: tx.id,
          })),
          { type: 'Transaction' as const, id: 'LIST_ALL' },
          ...(accountId ? [{ type: 'Transaction' as const, id: `LIST_${accountId}` }] : []),
        ];
      },
    }),

    /*-----------------The Mutation----------------------*/
    // Create transaction
    createTransaction: builder.mutation<
      Transaction,
      CreateTransactionPayload
    >({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),

      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const optimisticTx = buildOptimisticTransaction(body);

        /*-----------Patch transaction list----------*/
        const patchResult = dispatch(
          transactionApi.util.updateQueryData(
            'getTransactions',
            { accountId: body.accountId },
            (draft) => {
              const lastBalance = draft.transactions[0]?.runningBalance ?? 0;
              // Update running balance for optimistic tx
              optimisticTx.runningBalance =
                body.type === 'deposit'
                  ? lastBalance + body.amount
                  : lastBalance - body.amount;
              draft.transactions.unshift(optimisticTx);
            }
          )
        );

        /*--------------Patch account balance (derived)-----------*/
        const balancePath = dispatch(
          transactionApi.util.updateQueryData(
            'getTransactions',
            { accountId: body.accountId },
            (draft) => {
              const newBalance = computeBalance(draft.transactions);
              // balance projection is consumed by UI
              (draft as any).derivedBalance = newBalance;
            }
          )
        );

        try {
          const { data: realTx } = await queryFulfilled;

          /*-------------Replace temp tx with real tx ---------*/
          dispatch(
            transactionApi.util.updateQueryData(
              'getTransactions',
              { accountId: body.accountId },
              (draft) => {
                const index = draft.transactions.findIndex(
                  (tx) => tx.id === optimisticTx.id
                );
                if (index !== -1) {
                  draft.transactions[index] = realTx;
                }
              }
            )
          );
        } catch {
          patchResult.undo();
          balancePath.undo();
        }
      },

      invalidatesTags: (r, er, tx) => [
        { type: 'Transaction', id: `LIST_${tx.accountId}` },
        { type: 'Transaction', id: 'LIST_ALL' },
      ],
    }),

    // External bank transfer
    createExternalTransfer: builder.mutation<
      Transaction,
      {
        accountId: string;
        amount: number;
        pin: string;
        recipientName: string;
        recipientBank: string;
        recipientAccountNumber: number;
        description?: string;
        swiftCode?: string;
        iban?: string;
        routingNumber?: number;
      }
    >({
      query: (body) => ({ url: '/transactions/external', method: 'POST', body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const optimistic: Transaction = {
          id: `temp-ext-${Date.now()}`,
          amount: body.amount,
          type: 'transfer',
          status: 'pending',
          reference: 'PENDING',
          currency: 'USD',
          timestamp: new Date().toISOString(),
          description: body.description || 'External transfer',
          accountId: body.accountId,
          recipientAccountId: undefined,
          runningBalance: 0,
          direction: 'out',
        };

        const patch = dispatch(
          transactionApi.util.updateQueryData('getTransactions', { accountId: body.accountId }, (draft) => {
            const last = draft.transactions[0]?.runningBalance ?? 0;
            optimistic.runningBalance = last - body.amount;
            draft.transactions.unshift(optimistic);
          })
        );

        try {
          const { data: real } = await queryFulfilled;
          dispatch(
            transactionApi.util.updateQueryData('getTransactions', { accountId: body.accountId }, (draft) => {
              const idx = draft.transactions.findIndex((t) => t.id === optimistic.id);
              if (idx !== -1) draft.transactions[idx] = real;
            })
          );
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (r, e, arg) => [
        { type: 'Transaction', id: `LIST_${arg.accountId}` },
        { type: 'Transaction', id: 'LIST_ALL' },
      ],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useCreateExternalTransferMutation,
} = transactionApi;
