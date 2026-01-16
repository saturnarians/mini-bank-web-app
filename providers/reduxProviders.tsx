'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

 export function ReduxProvider({ children }: { children: React.ReactNode }) {
//   useEffect(() => {
//     if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
//       import('@/lib/msw/browser').then(({ worker }) => {
//         worker.start({ onUnhandledRequest: 'bypass' });
//       });
//     }
//   }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
