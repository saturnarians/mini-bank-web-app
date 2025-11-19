import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/lib/slices/auth-slice';
import { accountsSlice } from '@/lib/slices/accounts-slice';
import { transactionsSlice } from '@/lib/slices/transactions-slice';
import { usersSlice } from '@/lib/slices/users-slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    users: usersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
