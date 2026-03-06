import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Transaction } from "@/lib/domain/types";
import { accountApi } from "@/store/services/accountsApi";

export const adminTransactionsApi = createApi({
  reducerPath: "adminTransactionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Transaction", "Account"],

  endpoints: (builder) => ({
    adjustBalance: builder.mutation<
      Transaction,
      { accountId: string; amount: number; reason: string }
    >({
      query: (body) => ({
        url: "/admin/adjustBalance",
        method: "POST",
        body,
      }),

      async onQueryStarted({ accountId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            accountApi.util.invalidateTags([
              { type: "Account", id: accountId },
              { type: "Account", id: "LIST" },
              { type: "Account", id: "ADMIN_LIST" },
            ])
          );
        } catch {
          // Handled by mutation error path in callers.
        }
      },
    }),
  }),
});

export const { useAdjustBalanceMutation } = adminTransactionsApi;
