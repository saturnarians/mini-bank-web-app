'use client';

import { useMemo, useState } from 'react';
import { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionDetailModal } from './transaction-detail-modal';

interface TransactionTableProps {
  transactions: Transaction[];
  accountNumberById?: Record<string, string>;
  userName?: string;
}

export function TransactionTable({ transactions, accountNumberById, userName }: TransactionTableProps) {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  const selectedAccountNumber = useMemo(() => {
    if (!selected || !accountNumberById) return undefined;
    return accountNumberById[selected.accountId];
  }, [selected, accountNumberById]);

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <Table className="min-w-200 w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="whitespace-nowrap">
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <TableRow key={txn.id} className="hover:bg-muted/50">
                <TableCell className="w-12">{getIcon(txn.type)}</TableCell>
                <TableCell className="font-medium">{txn.description}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{txn.reference}</TableCell>
                <TableCell className="font-semibold">
                  <span className={txn.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                    {txn.type === 'deposit' ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(txn.status)}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(txn.timestamp).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelected(txn);
                      setOpen(true);
                    }}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TransactionDetailModal
        open={open}
        transaction={selected}
        accountNumber={selectedAccountNumber}
        userName={userName}
        onOpenChange={setOpen}
      />
    </div>
  );
}
