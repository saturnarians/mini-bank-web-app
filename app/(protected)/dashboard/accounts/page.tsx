'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  selectAccount,
} from '@/store/slices/accounts-slice';
import { Account } from '@/lib/types';
import { AccountFormData } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountCard } from '@/components/user/account-card';
import { AccountDialog } from '@/components/user/account-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountsPage() {
  const dispatch = useAppDispatch();
  const { accounts, isLoading, error } = useAppSelector(state => state.accounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleOpenDialog = (account?: Account) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAccount(undefined);
  };

  const handleSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedAccount) {
        await dispatch(updateAccount({ id: selectedAccount.id, data: { ...data } as any })).unwrap();
        toast({ title: 'Success', description: 'Account updated successfully' });
      } else {
        await dispatch(createAccount(data)).unwrap();
        toast({ title: 'Success', description: 'Account created successfully' });
      }
      handleCloseDialog();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save account',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await dispatch(deleteAccount(accountId)).unwrap();
      toast({ title: 'Success', description: 'Account deleted successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your bank accounts</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{accounts.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Combined Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">
                ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No accounts yet</p>
            <Button onClick={() => handleOpenDialog()}>Create Your First Account</Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <AccountDialog
        open={dialogOpen}
        account={selectedAccount}
        isLoading={isSubmitting}
        onOpenChange={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
