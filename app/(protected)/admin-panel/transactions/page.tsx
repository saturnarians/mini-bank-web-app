"use client";

import { useGetTransactionsQuery } from '@/store/services/transactionsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionRow } from '@/components/admins/transactions/transaction-row';

export default function AdminTransactionsPage() {
  const { data: transactions, isLoading, isError } = useGetTransactionsQuery({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !transactions) {
    return <div className="text-red-500">Failed to load transactions</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
