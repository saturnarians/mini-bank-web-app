'use client';

import { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionReceiptExport } from './transaction-receipt-export';

interface TransactionDetailModalProps {
  open: boolean;
  transaction: Transaction | null;
  accountNumber?: string;
  userName?: string;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailModal({
  open,
  transaction,
  accountNumber,
  userName,
  onOpenChange,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const amountLabel = `${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>View details and download this transaction receipt.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{transaction.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge>{transaction.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
              {amountLabel}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p>{new Date(transaction.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="font-mono text-sm">{transaction.reference || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Description</p>
            <p>{transaction.description}</p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium">Download Receipt</h4>
          <TransactionReceiptExport
            transaction={transaction}
            accountNumber={accountNumber}
            userName={userName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
