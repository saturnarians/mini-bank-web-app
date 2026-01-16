import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/auth-slice';
import { accountsSlice } from './slices/accounts-slice';
import { transactionsSlice } from './slices/transactions-slice';
import { usersSlice } from './slices/users-slice';
import { navigationSlice } from './slices/navigationSlice';
import { uiSlice } from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    users: usersSlice.reducer,
    navigation: navigationSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;