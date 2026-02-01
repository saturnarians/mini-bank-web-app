"use client";

import { Transaction } from '@/lib/types';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{transaction.type} — {transaction.amount} {transaction.currency}</div>
        <div className="text-sm text-muted-foreground">Ref: {transaction.reference} · {new Date(transaction.timestamp).toLocaleString()}</div>
      </div>
      <div className="text-sm text-right">
        <div className="font-semibold">{transaction.status || 'completed'}</div>
        <div className="text-xs text-muted-foreground">Account: {transaction.accountId}</div>
      </div>
    </div>
  );
}
