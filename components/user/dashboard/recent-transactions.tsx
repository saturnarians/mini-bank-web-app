"use client";

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Transaction = {
  id: string;
  description: string;
  counterparty: string; // Who sent it or who received it
  amount: number;       // Positive for incoming, negative for outgoing
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
};

export function RecentTransactions({ transactions, isLoading }: { transactions: Transaction[], isLoading?: boolean }) {
  if (isLoading) return <div className="space-y-3">{/* Skeletons... */}</div>;

  return (
    <div className="space-y-3">
      {transactions.map((txn) => {
        const isIncoming = txn.amount > 0;
        
        return (
          <div key={txn.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isIncoming ? 'bg-green-100' : 'bg-muted'}`}>
                {isIncoming ? 
                  <ArrowDownLeft className="h-4 w-4 text-green-600" /> : 
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                }
              </div>
              <div>
                <p className="font-semibold text-sm">{txn.description || txn.counterparty}</p>
                <p className="text-xs text-muted-foreground">{isIncoming ? 'From: ' : 'To: '}{txn.counterparty}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold text-sm ${isIncoming ? 'text-green-600' : ''}`}>
                {isIncoming ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground">{txn.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}