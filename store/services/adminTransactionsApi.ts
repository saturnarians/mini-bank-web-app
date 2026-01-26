import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Transaction } from "@/lib/domain/types";

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

      invalidatesTags: (r, e, a) => [
        { type: "Account", id: a.accountId },
      ],
    }),
  }),
});

export const { useAdjustBalanceMutation } = adminTransactionsApi;
