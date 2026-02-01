'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { setInitialAuth } from '@/store/slices/auth-slice';

function Hydrator({ initialUser, children }: { initialUser: any; children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setInitialAuth(initialUser ?? null));
  }, [initialUser, dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: any }) {
  return (
    <Provider store={store}>
      <Hydrator initialUser={initialUser}>{children}</Hydrator>
    </Provider>
  );
}
