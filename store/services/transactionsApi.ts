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
    type: body.type,  // deposit | withdrawal
    status: 'pending',
    reference: 'PENDING',
    currency: 'USD',
    timestamp: new Date().toISOString(),
    description: body.description,
    accountId: body.accountId,
    recipientAccountId: body.recipientAccountId,
    runningBalance: body.runningBalance || 0,
  };
}

/* ----------------API-------------------*/

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Transaction', 'Account'],
  endpoints: (builder) => ({

//-------------- QUERY Fetch transactions (per account)
    getTransactions: builder.query<
      { transactions: Transaction[]; nextCursor: string | null },
      { accountId: string; cursor?: string | null }
    >({
      query: ({ accountId, cursor }) => ({
        url: '/transactions',
        params: { accountId, cursor},
      }),
      providesTags: (result, err, { accountId }) =>
        result
          ? [
            // 1. Tag individual items for granular updates
              ...result.transactions.map((tx) => ({
                type: 'Transaction' as const,
                id: tx.id,
              })),
              // 2. Tag the specific account's list (The "Smart Merge")
              { type: 'Transaction', id: `LIST_${accountId}` },
            ]
          : [{ type: 'Transaction', id: `LIST_${accountId}` }],
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
            "getTransactions",
            { accountId: body.accountId },
            (draft) => {
              const newBalance = computeBalance(draft.transactions);
              // balance projection is consumed by UI
              (draft as any).derivedBalance = newBalance;
            }
          )
        );

        try {
          const { data:realTx } = await queryFulfilled;
          
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
        { type: 'Transaction', id: `LIST_${tx.accountId}` }],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
} = transactionApi;
