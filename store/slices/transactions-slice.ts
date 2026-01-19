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
  nextCursor: null,
  hasMore: true,
};

const cache = new Map<string, { data: Transaction[]; nextCursor: string | null; hasMore: boolean }>();
const pendingRequests = new Set<string>();

function addRequestToQueue(requestId: string) {
  pendingRequests.add(requestId);
}

function removeRequestFromQueue(requestId: string) {
  pendingRequests.delete(requestId);
}

export const fetchTransactions = createAsyncThunk<
  { data: Transaction[]; nextCursor: string | null; hasMore: boolean },
  { accountId?: string; cursor?: string | null; reset?: boolean; requestId: string }
>(
  'transactions/fetchTransactions',
  async ({ accountId, cursor, requestId, reset }, { rejectWithValue }) => {
    const cacheKey = `transactions-${accountId}-${cursor || 'start'}`;

    // 1. Return cached data immediately if available (stale)
    if (cache.has(cacheKey) && !reset) return cache.get(cacheKey)!;

    // 2. Deduplicate requests
    if (pendingRequests.has(requestId)) {
      return rejectWithValue('Request already in progress');
    }
    addRequestToQueue(requestId);

    try {
      const params = new URLSearchParams();
      if (accountId) params.set('accountId', accountId);
      if (cursor) params.set('cursor', cursor);
      params.set('limit', '20');

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      cache.set(cacheKey, data); // Update cache for SWR

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    } finally {
      removeRequestFromQueue(requestId);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: TransactionFormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) return rejectWithValue(result.error);
      return result; // Returns the Transaction object
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
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
    resetTransactions: (state) => {
      state.transactions = [];
      state.nextCursor = null;
      state.hasMore = true;
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

        // Cursor pagination: append or replace
        if (action.meta.arg.reset) {
          state.transactions = action.payload.data;
        } else {
          state.transactions = [...state.transactions, ...action.payload.data];
        }

        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create transaction';
      });
  },
});

export const { setFilters, setSortBy, setSortOrder, clearError, resetTransactions } = transactionsSlice.actions;
