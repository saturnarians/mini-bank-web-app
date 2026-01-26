import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/auth-slice';
import { usersSlice } from './slices/users-slice';
import { navigationSlice } from './slices/navigationSlice';
import { uiSlice } from './slices/uiSlice';
import { transactionApi } from './services/transactionsApi';
import { accountApi } from './services/accountsApi';
import { transactionsUiSlice }  from './slices/transactionUi-Slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    navigation: navigationSlice.reducer,
    ui: uiSlice.reducer,
    transactionsUi: transactionsUiSlice.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(accountApi.middleware)
  .concat(transactionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;