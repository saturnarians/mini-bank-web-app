'use client';


import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Account } from '@/lib/types';
import { AccountSuspendResumeDialog } from '@/components/admins/account-suspend-resume-dialog';
import { CreateBalanceDialog } from '@/components/admins/create-balance-dialog';
import { TransactionHistoryViewer } from '@/components/admins/transaction-history-viewer';
import { useGetAdminAccountsQuery } from '@/store/services/accountsApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Complete Admin Dashboard Component
 * Manage accounts, balances, and view transaction history
 */

export const dynamic = "force-dynamic";

export function AdminDashboard() {
  // Use admin-specific query that includes user relationship data
  const { data: adminAccounts = [], isLoading, error: queryError, refetch } = useGetAdminAccountsQuery({ status: undefined });
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [historyAccountId, setHistoryAccountId] = useState<string>('');

  // Update accounts when admin query data changes
  useEffect(() => {
    if (adminAccounts && adminAccounts.length > 0) {
      setAccounts(adminAccounts);
      setError(null);
    }
    setLoading(isLoading);
    if (queryError) {
      setError('Failed to fetch accounts');
    }
  }, [adminAccounts, isLoading, queryError]);

  // Refetch accounts function
  const fetchAccounts = useCallback(async () => {
    refetch();
  }, [refetch]);

  // Filter and search accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = 
      (account.accountNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (account.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (account.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = (account: Account) => {
    setSelectedAccount(account);
    setSuspendDialogOpen(true);
  };

  const handleResume = (account: Account) => {
    setSelectedAccount(account);
    setResumeDialogOpen(true);
  };

  const handleCreateBalance = (account: Account) => {
    setSelectedAccount(account);
    setBalanceDialogOpen(true);
  };

  const handleViewHistory = (accountId: string) => {
    setHistoryAccountId(accountId);
  };

  const handleDialogSuccess = () => {
    fetchAccounts();
  };

  const getStatusBadgeVariant = (status?: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage accounts, balances, and view transaction history
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 p-1 sm:grid-cols-2">
          <TabsTrigger value="accounts" className="w-full whitespace-normal text-center">Accounts Management</TabsTrigger>
          <TabsTrigger value="transactions" className="w-full whitespace-normal text-center">Transactions</TabsTrigger>
        </TabsList>

        {/* Accounts Management Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Filters and Search */}
          <Card className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by account number, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Status</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  title="Filter Accounts by Status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchAccounts}
                  className="w-full"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          {/* Accounts Table */}
          <Card className="overflow-hidden">
            <div className="p-4">
              <h2 className="mb-4 text-xl font-semibold">
                All Accounts ({filteredAccounts.length})
              </h2>

              {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {accounts.length === 0 ? 'No accounts found' : 'No accounts match your filters'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Number</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-sm">
                            {account.accountNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{account.user?.name || 'N/A'}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {account.user?.email || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {account.accountType}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${account.balance.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(account.status)}>
                              {account.status ?? 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                            {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 flex-wrap">
                              {account.status === 'suspended' ? (
                                <Button
                                  onClick={() => handleResume(account)}
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                >
                                  Resume
                                </Button>
                              ) : account.status === 'active' ? (
                                <Button
                                  onClick={() => handleSuspend(account)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  Suspend
                                </Button>
                              ) : null}
                              <Button
                                onClick={() => handleCreateBalance(account)}
                                size="sm"
                                variant="outline"
                              >
                                Set Bal
                              </Button>
                              <Button
                                onClick={() => handleViewHistory(account.id)}
                                size="sm"
                                variant="outline"
                              >
                                History
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          {historyAccountId ? (
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <Button
                  onClick={() => setHistoryAccountId('')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  ← Back to Accounts
                </Button>
                <span className="text-sm font-medium break-all">Account: {historyAccountId}</span>
              </div>
              <TransactionHistoryViewer accountId={historyAccountId} />
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Select an account from the Accounts tab to view transaction history
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AccountSuspendResumeDialog
        account={selectedAccount}
        isOpen={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        action="suspend"
        onSuccess={handleDialogSuccess}
      />

      <AccountSuspendResumeDialog
        account={selectedAccount}
        isOpen={resumeDialogOpen}
        onOpenChange={setResumeDialogOpen}
        action="resume"
        onSuccess={handleDialogSuccess}
      />

      <CreateBalanceDialog
        account={selectedAccount}
        isOpen={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
