'use client';

import { useGetAccountsQuery } from '@/store/services/accountsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccountRow from '@/components/admins/accounts/account-row';

export default function AdminAccountsPage() {
  const { data: accounts, isLoading, isError } = useGetAccountsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !accounts) {
    return (
      <div className="text-red-500">
        Failed to load accounts
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Accounts (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <AccountRow key={account.id} account={account} isAdmin />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
