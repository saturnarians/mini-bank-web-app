import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Transaction } from '@/lib/types';
import type { TransactionFormData } from '@/lib/schemas';

function buildOptimisticTransaction(
  body: TransactionFormData
): Transaction {
  return {
    id: `temp-${Date.now()}`,
    amount: body.amount,
    type: body.type,  // deposit | withdrawal
    status: 'pending',
    reference: 'PENDING',
    currency: 'USD',
    timestamp: new Date().toISOString(),
    description: body.description,
    accountId: body.accountId,
    recipientAccountId: body.recipientAccountId,
  };
}

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({

    // Fetch transactions (per account)
    getTransactions: builder.query<
      { transactions: Transaction[]; nextCursor: string | null },
      { accountId: string; cursor?: string | null }
    >({
      query: ({ accountId, cursor }) => {
        const params = new URLSearchParams({
          accountId,
          limit: '20',
        });
        if (cursor) params.set('cursor', cursor);
        return `/transactions?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.transactions.map((tx) => ({
                type: 'Transaction' as const,
                id: tx.id,
              })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    // Create transaction
    createTransaction: builder.mutation<Transaction, TransactionFormData>({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),

      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const optimisticTx = buildOptimisticTransaction(body);

        const patchResult = dispatch(
          transactionApi.util.updateQueryData(
            'getTransactions',
            { accountId: body.accountId },
            (draft) => {
              draft.transactions.unshift(optimisticTx);
            }
          )
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            transactionApi.util.updateQueryData(
              'getTransactions',
              { accountId: body.accountId },
              (draft) => {
                const index = draft.transactions.findIndex(
                  (tx) => tx.id === optimisticTx.id
                );
                if (index !== -1) {
                  draft.transactions[index] = data;
                }
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },

      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
} = transactionApi;
