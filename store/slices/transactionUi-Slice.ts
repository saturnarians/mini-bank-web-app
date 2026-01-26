import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TransactionsUiState = {
  filters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
};

const initialState: TransactionsUiState = {
  filters: {},
  sortBy: 'date',
  sortOrder: 'desc',
};

export const transactionsUiSlice = createSlice({
  name: 'transactionsUi',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<TransactionsUiState['filters']>) {
      state.filters = action.payload;
    },
    setSortBy(state, action: PayloadAction<'date' | 'amount'>) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<'asc' | 'desc'>) {
      state.sortOrder = action.payload;
    },
  },
});

export const {
  setFilters,
  setSortBy,
  setSortOrder,
} = transactionsUiSlice.actions;

export default transactionsUiSlice.reducer;
