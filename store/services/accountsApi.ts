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
    createdAt: new Date() //.toISOString(),
  };
}

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Account"],

  endpoints: (builder) => ({

    // 👇 QUERY getAccounts
    getAccounts: builder.query<Account[], {status?: string; type?: string | void}>({
      query: (params) => ({url: "/accounts", params}),
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
        // 1. Create the temporary optimistic object (ensure it has a temp ID)
        const optimisticAccount = buildOptimisticAccount(body);
        // 2. Patch the "All Accounts" list
        const patchResult = dispatch(
          accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
            draft.push(optimisticAccount);
          }),
        );
        // 3. Patch the "Active" list
        const patchActive = dispatch(
      accountApi.util.updateQueryData("getAccounts", { status: 'active' }, (draft) => {
        draft.push(optimisticAccount);
      })
    );
    


        try {
          const { data } = await queryFulfilled;

          const updateRealData = (cacheKey: any) => {
          dispatch(
            accountApi.util.updateQueryData( "getAccounts", {}, (draft) => {
                const index = draft.findIndex((acc) => acc.id === optimisticAccount.id,);
                if (index !== -1) draft[index] = data;
              },
            ),
          ) };

          updateRealData({});
          updateRealData({ status: 'active' });
        } catch {
          patchResult.undo();
          patchActive.undo();
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
  async onQueryStarted({ id, ...body }, { dispatch, queryFulfilled }) {
      // 1. Update the main "All Accounts" list cache
    const patchResult = dispatch(
      accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
        const account = draft.find((acc) => acc.id === id);
        if (account) {
          // Merge the new changes into the existing account object
          Object.assign(account, body);
        }
      })
    );
 // PATCH 2: Update the specific "getAccountById" cache
    // const patchDetail = dispatch(
    //   accountApi.util.updateQueryData("getAccountById", id, (draft) => {
    //     // Here, the draft IS the account object itself
    //     Object.assign(draft, body);
    //   })
    // );

    try {
      await queryFulfilled;
    } catch {
      // Revert if the server rejects the update (e.g., validation error)
      patchResult.undo();
    }
  },

      invalidatesTags: (result, error, { id }) => [{ type: "Account", id }],
    }),

    // 👇 MUTATION suspendAccount
    suspendAccount: builder.mutation<Account, SuspendAccountFormData & { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/accounts/${id}/suspend`,
        method: "POST",
        body: { reason },
      }),
      // Optimistic update: mark account as suspended immediately
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
            const account = draft.find((acc) => acc.id === id);
            if (account) account.status = "suspended";
          }),
        );

        //update the active
        const patchActive = dispatch(
       accountApi.util.updateQueryData("getAccounts", { status: 'active' }, (draft) => {
      return draft.filter((acc) => acc.id !== id);
    })
  );

        try {
          await queryFulfilled; // wait for server
        } catch {
          patchResult.undo(); // revert if server fails
          patchActive.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
    { type: "Account", id },
    { type: "Account", id: "LIST" }
  ],
    }),


    // 👇 MUTATION suspendAccount
    resumeAccount: builder.mutation<Account,{ id: string; reason: string }>({
  query: ({ id, reason }) => ({
    url: `/accounts/${id}/resume`,
    method: "POST",
    body: { reason },
  }),

  async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      accountApi.util.updateQueryData(
        "getAccounts",
        {},
        (draft) => {
          const acc = draft.find((a) => a.id === id);
          if (acc) acc.status = "active";
        },
      ),
    );

    const patchSuspended = dispatch(
      accountApi.util.updateQueryData("getAccounts", { status: 'suspended' }, (draft) => {
        return draft.filter((a) => a.id !== id);
      })
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
      patchSuspended.undo();
    }
  },

  invalidatesTags: (r, e, { id }) => [
    { type: "Account", id },
    { type: "Account", id: "LIST" },
  ],
}),


    // 👇 MUTATION deleteAccount

    deleteAccount: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
    // Optimistically remove the account from the list
    const patchResult = dispatch(
      accountApi.util.updateQueryData("getAccounts", {status: 'active'}, (draft) => {
        return draft.filter((acc) => acc.id !== id);
      })
    );

    const patchActive = dispatch(
      accountApi.util.updateQueryData("getAccounts", { status: 'active' }, (draft) => {
        return draft.filter((acc) => acc.id !== id);
      })
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
      patchActive.undo();
    }
  },
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
  useResumeAccountMutation,
} = accountApi;
