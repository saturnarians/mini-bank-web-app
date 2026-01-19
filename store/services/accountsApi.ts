import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Account } from "@/lib/types";
import type { AccountFormData, SuspendAccountFormData } from "@/lib/schemas";

/**
 * Small helper – stays in this file (or a nearby utils file)
 * This is NOT Redux state, just a builder function.
 */
function buildOptimisticAccount(body: AccountFormData): Account {
  return {
    id: `temp-${Date.now()}`,
    userId: "me", // placeholder, replaced by server
    currency: "USD", // must exist for UI stability
    accountNumber: "PENDING",
    accountType: body.accountType,
    status: "active",
    balance: body.initialBalance ?? 0,
    createdAt: new Date().toISOString(),
  };
}

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Account"],

  endpoints: (builder) => ({

    // 👇 QUERY getAccounts
    getAccounts: builder.query<Account[], void>({
      query: () => "/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((acc) => ({
                type: "Account" as const,
                id: acc.id,
              })),
              { type: "Account", id: "LIST" },
            ]
          : [{ type: "Account", id: "LIST" }],
    }),

    // 👇 MUTATION (THIS is where your code goes)
    createAccount: builder.mutation<Account, AccountFormData>({
      query: (body) => ({
        url: "/accounts",
        method: "POST",
        body,
      }),

      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const optimisticAccount = buildOptimisticAccount(body);

        const patchResult = dispatch(
          accountApi.util.updateQueryData("getAccounts", undefined, (draft) => {
            draft.push(optimisticAccount);
          }),
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            accountApi.util.updateQueryData(
              "getAccounts",
              undefined,
              (draft) => {
                const index = draft.findIndex(
                  (acc) => acc.id === optimisticAccount.id,
                );
                if (index !== -1) draft[index] = data;
              },
            ),
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: "Account", id: "LIST" }],
    }),

    // 👇 MUTATION updateAccount

    updateAccount: builder.mutation<Account, AccountFormData & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Account", id }],
    }),

    // 👇 MUTATION suspendAccount
    suspendAccount: builder.mutation<Account, SuspendAccountFormData & { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/accounts/${id}/suspend`,
        method: "POST",
        body: { reason },
      }),
      // Optimistic update: mark account as inactive immediately
      async onQueryStarted({ id, reason }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          accountApi.util.updateQueryData("getAccounts", undefined, (draft) => {
            const account = draft.find((acc) => acc.id === id);
            if (account) account.status = "inactive";
          }),
        );

        try {
          await queryFulfilled; // wait for server
        } catch {
          patchResult.undo(); // revert if server fails
        }
      },
      invalidatesTags: (result, error, { id }) => [
    { type: "Account", id },
    { type: "Account", id: "LIST" }
  ],
    }),

    // 👇 MUTATION deleteAccount

    deleteAccount: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Account", id },
        { type: "Account", id: "LIST" },
      ],
    }),
  }),

});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useSuspendAccountMutation,
} = accountApi;
