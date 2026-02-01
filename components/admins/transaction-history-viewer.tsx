'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionHistoryViewerProps {
  accountId?: string;
  userId?: string;
}

export function TransactionHistoryViewer({
  accountId,
  userId,
}: TransactionHistoryViewerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (accountId) params.append('accountId', accountId);
      if (userId) params.append('userId', userId);
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', `${startDate}T00:00:00Z`);
      if (endDate) params.append('endDate', `${endDate}T23:59:59Z`);
      params.append('limit', limit.toString());
      params.append('skip', ((page - 1) * limit).toString());

      const response = await fetch(`/api/transactions/history?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      const result = await response.json();
      setTransactions(result.transactions || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [accountId, userId, type, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [accountId, userId, page, limit, type, startDate, endDate]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="mb-4 font-semibold">Filters</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setType('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            No transactions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs">
                    {new Date(tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">
                    {tx.type}
                  </TableCell>
                  <TableCell className={tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                  </TableCell>
                  <TableCell>{tx.runningBalance.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{tx.description}</TableCell>
                  <TableCell className="capitalize">{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {transactions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} transactions
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, pages))].map((_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > pages) return null;

                return (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? 'default' : 'outline'}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
