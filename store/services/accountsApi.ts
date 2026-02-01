import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Account } from "@/lib/types";


type GetAccountsParams = {
  status?: "active" | "suspended";
};

// -------------  For RTK Query Params  -------------
// export type GetAccountsParams = {
//   status?: string;
//   type?: string;
//   includeSuspended?: boolean; // admin-only
// };

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Account"],

  endpoints: (builder) => ({
    // ======================
    // GET ACCOUNTS
    // ======================
    getAccounts: builder.query<Account[], GetAccountsParams>({
      query: (params = {}) => ({
        url: "/accounts",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Account" as const, id: a.id })),
              { type: "Account", id: "LIST" },
            ]
          : [{ type: "Account", id: "LIST" }],
    }),

    // ======================
    // CREATE ACCOUNT
    // ======================
    createAccount: builder.mutation<Account, Partial<Account>>({
      query: (body) => ({
        url: "/accounts",
        method: "POST",
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
            draft.unshift({
              id: "temp-id",
              userId:"me",
              currency:"USD",
              accountNumber: "PENDING",
              accountType: body.accountType ?? "checking",
              balance: body.balance ?? 0,
              status: "active",
              createdAt: new Date().toISOString(),
            } as Account);
          })
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
              const i = draft.findIndex((a) => a.id === "temp-id");
              if (i !== -1) draft[i] = data;
            })
          );
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [{ type: "Account", id: "LIST" }],
    }),

    // ======================
    // SUSPEND ACCOUNT
    // ======================
    suspendAccount: builder.mutation<Account, { id: string; reason: string }>({
      query: ({id, reason}) => ({
        url: `/accounts/${id}/suspend`,
        method: "PATCH",
        body:{reason},
      }),
      async onQueryStarted({id}, { dispatch, queryFulfilled }) {
        const patchAll = dispatch(
          accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
            const acc = draft.find((a) => a.id === id);
            if (acc) acc.status = "suspended";
          })
        );

        const patchActive = dispatch(
          accountApi.util.updateQueryData(
            "getAccounts",
            { status: "active" },
            (draft) => {
              const index = draft.findIndex((a) => a.id === id);
              if (index !== -1) draft.splice(index, 1);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchAll.undo();
          patchActive.undo();
        }
      },
    }),

    // ======================
    // RESUME ACCOUNT
    // ======================
    resumeAccount: builder.mutation<Account, { id: string; reason: string }>({
      query: ({id, reason}) => ({
        url: `/accounts/${id}/resume`,
        method: "PATCH",
        body:{reason},
      }),
      async onQueryStarted({id}, { dispatch, queryFulfilled }) {
        const patchAll = dispatch(
          accountApi.util.updateQueryData("getAccounts", {}, (draft) => {
            const acc = draft.find((a) => a.id === id);
            if (acc) acc.status = "active";
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchAll.undo();
        }
      },
    }),

    // ======================
    // GET ACCOUNTS (ADMIN)
    // Admin-specific query that includes user relationship data
    // ======================
    getAdminAccounts: builder.query<Account[], GetAccountsParams>({
      query: (params = {}) => ({
        url: "/admin/accounts-list",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Account" as const, id: a.id })),
              { type: "Account", id: "ADMIN_LIST" },
            ]
          : [{ type: "Account", id: "ADMIN_LIST" }],
    }),
    
  }),
});

export const {
  useGetAccountsQuery,
  useGetAdminAccountsQuery,
  useCreateAccountMutation,
  useSuspendAccountMutation,
  useResumeAccountMutation,
} = accountApi;
