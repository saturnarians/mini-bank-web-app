'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Account } from '@/lib/types';
import { AccountSuspendResumeDialog } from './account-suspend-resume-dialog';
import { CreateBalanceDialog } from './create-balance-dialog';
import { TransactionHistoryViewer } from './transaction-history-viewer';
import { AddTransactionHistoryDialog } from './add-transaction-history-dialog';
import { PendingTransactionsViewer } from './pending-transactions-viewer';
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
import { ChevronRight, Plus, ArrowLeft } from 'lucide-react';

/**
 * Mobile-Responsive Admin Dashboard Component
 * Optimized for both mobile and desktop viewing
 */
export function AdminDashboardResponsive() {
  const { data: adminAccounts = [], isLoading, error: queryError, refetch } = useGetAdminAccountsQuery({ status: undefined });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [addHistoryDialogOpen, setAddHistoryDialogOpen] = useState(false);
  const [historyAccountId, setHistoryAccountId] = useState<string>('');

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleAddHistory = (account: Account) => {
    setSelectedAccount(account);
    setAddHistoryDialogOpen(true);
  };

  const handleViewHistory = (accountId: string) => {
    setHistoryAccountId(accountId);
  };

  const handleDialogSuccess = () => {
    fetchAccounts();
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
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

  // Mobile Card View for accounts
  const MobileAccountCard = ({ account }: { account: Account }) => (
    <div
      onClick={() => isMobile && handleViewHistory(account.id)}
      className="border rounded-lg p-4 mb-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-sm font-semibold">{account.accountNumber}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{account.user?.name || 'Unknown'}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(account.status)} className="text-xs">
          {account.status}
        </Badge>
      </div>

      <div className="mb-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">Balance</p>
        <p className="text-lg font-bold text-green-600">${account.balance.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Type</p>
          <p className="text-sm font-medium capitalize">{account.accountType}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Created</p>
          <p className="text-sm font-medium">
            {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {account.status === 'suspended' ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleResume(account);
            }}
            size="sm"
            className="flex-1 text-xs"
          >
            Resume
          </Button>
        ) : account.status === 'active' ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSuspend(account);
            }}
            size="sm"
            variant="outline"
            className="flex-1 text-xs text-red-600"
          >
            Suspend
          </Button>
        ) : null}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleCreateBalance(account);
          }}
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
        >
          Balance
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAddHistory(account);
          }}
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
        >
          Add Tx
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 gap-1 md:gap-2">
          <TabsTrigger value="accounts" className="text-xs md:text-sm">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs md:text-sm">
            History
          </TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs md:text-sm">
            Approvals
          </TabsTrigger>
          <TabsTrigger value="settings" className="hidden md:block text-xs md:text-sm">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-2 md:flex md:gap-3 md:space-y-0">
                <Input
                  placeholder="Search account number, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[150px] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <Button
                    onClick={fetchAccounts}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredAccounts.length === 0 && (
                <div className="rounded-lg border border-dashed py-8 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No accounts found
                  </p>
                </div>
              )}

              {/* Mobile View: Card Layout */}
              {!loading && !error && isMobile && filteredAccounts.length > 0 && (
                <div className="space-y-2">
                  {filteredAccounts.map((account) => (
                    <MobileAccountCard key={account.id} account={account} />
                  ))}
                </div>
              )}

              {/* Desktop View: Table Layout */}
              {!loading && !error && !isMobile && filteredAccounts.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="text-xs md:text-sm">Account Number</TableHead>
                        <TableHead className="text-xs md:text-sm">Owner</TableHead>
                        <TableHead className="text-xs md:text-sm">Type</TableHead>
                        <TableHead className="text-xs md:text-sm text-right">Balance</TableHead>
                        <TableHead className="text-xs md:text-sm">Status</TableHead>
                        <TableHead className="text-xs md:text-sm">Created</TableHead>
                        <TableHead className="text-xs md:text-sm text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-xs md:text-sm">
                            {account.accountNumber}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            <div>
                              <p className="font-medium">{account.user?.name || 'N/A'}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {account.user?.email || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-xs md:text-sm">
                            {account.accountType}
                          </TableCell>
                          <TableCell className="font-semibold text-xs md:text-sm text-right">
                            ${account.balance.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(account.status)} className="text-xs">
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                            {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {account.status === 'suspended' ? (
                                <Button
                                  onClick={() => handleResume(account)}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-green-600"
                                >
                                  Resume
                                </Button>
                              ) : account.status === 'active' ? (
                                <Button
                                  onClick={() => handleSuspend(account)}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-red-600"
                                >
                                  Suspend
                                </Button>
                              ) : null}
                              <Button
                                onClick={() => handleCreateBalance(account)}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                Balance
                              </Button>
                              <Button
                                onClick={() => handleAddHistory(account)}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                Add Tx
                              </Button>
                              <Button
                                onClick={() => handleViewHistory(account.id)}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <ChevronRight className="h-3 w-3" />
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
        <TabsContent value="transactions" className="space-y-4">
          {historyAccountId ? (
            <Card className="p-4 md:p-6">
              <div className="space-y-4">
                <Button
                  onClick={() => setHistoryAccountId('')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Accounts
                </Button>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Account: {historyAccountId}
                  </p>
                </div>
                <TransactionHistoryViewer accountId={historyAccountId} />
              </div>
            </Card>
          ) : (
            <Card className="p-8 md:p-12 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Select an account from the Accounts tab to view transaction history
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Click on an account card or use the arrow button to view details
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className=" overflow-x-auto space-y-4">
          <Card className="p-4 md:p-6">
            <PendingTransactionsViewer onActionComplete={fetchAccounts} />
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="hidden md:block space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Coming soon: Additional admin configuration options
              </p>
            </div>
          </Card>
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

      <AddTransactionHistoryDialog
        account={selectedAccount}
        isOpen={addHistoryDialogOpen}
        onOpenChange={setAddHistoryDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
