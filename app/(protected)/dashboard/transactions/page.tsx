'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchTransactions,
  createTransaction,
} from '@/lib/slices/transactions-slice';
import { TransactionFormData } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionDialog } from '@/components/transaction-dialog';
import { TransactionFilters } from '@/components/transaction-filters';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, error, filters, sortBy, sortOrder } = useAppSelector(
    state => state.transactions
  );
  const { accounts } = useAppSelector(state => state.accounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Set first account as default
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((txn) => {
      if (filters.type && txn.type !== filters.type) return false;
      if (filters.status && txn.status !== filters.status) return false;
      if (filters.dateFrom && new Date(txn.timestamp) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(txn.timestamp) > new Date(filters.dateTo)) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        createTransaction({ accountId: selectedAccountId, data })
      ).unwrap();
      toast({ title: 'Success', description: 'Transaction created successfully' });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create transaction',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and manage your transactions</p>
        </div>
        {accounts.length > 0 && (
          <Button
            onClick={() => setDialogOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{transactions.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'completed').length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'pending').length}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border">
        <TransactionFilters />
      </div>

      {/* Table */}
      {isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>
              Filtered and sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filteredTransactions} />
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      {selectedAccountId && (
        <TransactionDialog
          open={dialogOpen}
          accountId={selectedAccountId}
          isLoading={isSubmitting}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
