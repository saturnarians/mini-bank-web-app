'use client';

import { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetAccountsQuery } from '@/store/services/accountsApi';

function normalizeStatus(status?: string | null) {
  return (status ?? '').trim().toLowerCase();
}

export function SuspendedUserGate({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const { data: accounts = [] } = useGetAccountsQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const isSuspendedUser =
    user?.role === 'user' && normalizeStatus(user?.status) === 'suspended';
  const hasSuspendedAccount =
    user?.role === 'user' &&
    accounts.some((account) => normalizeStatus(account.status) === 'suspended');

  if (!isSuspendedUser && !hasSuspendedAccount) return <>{children}</>;

  return (
    <div className="space-y-4">
      {isSuspendedUser ? (
        <Alert
          variant="destructive"
          className="border-red-600 bg-red-50 dark:bg-red-950/30"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-bold text-red-700 dark:text-red-300">
            YOUR ACCOUNT IS SUSPENDED: Transactions and account actions are
            disabled. Please contact customer care.
          </AlertDescription>
        </Alert>
      ) : hasSuspendedAccount ? (
        <Alert
          variant="destructive"
          className="border-red-600 bg-red-50 dark:bg-red-950/30"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-bold text-red-700 dark:text-red-300">
            ONE OR MORE OF YOUR BANK ACCOUNTS ARE SUSPENDED: Suspended accounts
            cannot make transactions.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className={isSuspendedUser ? 'pointer-events-none opacity-60' : ''}>
        {children}
      </div>
    </div>
  );
}
