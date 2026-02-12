'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/lib/types';
import { TransactionApprovalDialog } from './transaction-approval-dialog';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PendingTransactionsViewerProps {
  onActionComplete?: () => void;
}

export function PendingTransactionsViewer({
  onActionComplete,
}: PendingTransactionsViewerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/transactions/pending?status=${filter}&limit=50`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogAction('approve');
    setIsDialogOpen(true);
  };

  const handleReject = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogAction('reject');
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedTransaction(null);
      setDialogAction(null);
    }
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    fetchTransactions();
    onActionComplete?.();
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.accountId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 dark:bg-green-900/30">
            <CheckCircle className="h-3 w-3 text-green-700 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Approved
            </span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 dark:bg-red-900/30">
            <XCircle className="h-3 w-3 text-red-700 dark:text-red-400" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">
              Rejected
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 dark:bg-yellow-900/30">
            <AlertCircle className="h-3 w-3 text-yellow-700 dark:text-yellow-400" />
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
              Pending
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Filter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction Approvals</h3>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by description, reference, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-300">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center dark:border-slate-600">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No {filter} transactions found
          </p>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="whitespace-nowrap">Reference</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference}
                  </TableCell>
                  <TableCell className="capitalize">
                    {transaction.type}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.approvalStatus || 'pending')}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.approvalStatus === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleApprove(transaction)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                          onClick={() => handleReject(transaction)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {transaction.approvalStatus === 'approved' && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ✓ Approved
                      </span>
                    )}
                    {transaction.approvalStatus === 'rejected' && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        ✗ Rejected
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approval Dialog */}
      {dialogAction && (
        <TransactionApprovalDialog
          transaction={selectedTransaction}
          isOpen={isDialogOpen}
          onOpenChange={handleDialogClose}
          action={dialogAction}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
