import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TransactionsState, Transaction } from '@/lib/types';
import type { TransactionFormData } from '@/lib/schemas';

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
  filters: {},
  sortBy: 'date',
  sortOrder: 'desc',
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (accountId?: string) => {
    const url = accountId ? `/api/transactions?accountId=${accountId}` : '/api/transactions';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async ({ accountId, data }: { accountId: string; data: TransactionFormData }) => {
    const response = await fetch(`/api/accounts/${accountId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  }
);

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'date' | 'amount'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create transaction';
      });
  },
});

export const { setFilters, setSortBy, setSortOrder, clearError } = transactionsSlice.actions;
