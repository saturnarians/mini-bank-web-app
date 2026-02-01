'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Account } from '@/lib/types';

interface CreateBalanceDialogProps {
  account: Account | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBalanceDialog({
  account,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateBalanceDialogProps) {
  const [balance, setBalance] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !balance) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const balanceNum = parseFloat(balance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        throw new Error('Balance must be a valid non-negative number');
      }

      const response = await fetch('/api/admin/accounts/create-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          balance: balanceNum,
          reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create balance');
      }

      const result = await response.json();
      setSuccess(true);
      setBalance('');
      setReason('');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const balanceChange =
    balance && account
      ? parseFloat(balance) - account.balance
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create/Set Account Balance</DialogTitle>
          <DialogDescription>Set or adjust the account balance. This action is logged and audited.</DialogDescription>
        </DialogHeader>

        {account && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <p className="text-sm font-medium">Account Details</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Number: {account.accountNumber}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Type: {account.accountType}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Current Balance: ${account.balance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">New Balance (USD)</Label>
              <Input
                id="balance"
                type="number"
                placeholder="Enter new balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                step="0.01"
                min="0"
                required
              />
              {balance && (
                <p className={`text-xs ${balanceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Change: {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(2)} USD
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (minimum 5 characters)</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this balance is being set..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minLength={5}
                required
                className="min-h-24"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                Balance created/updated successfully!
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || !balance || reason.length < 5 || success}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Processing...' : 'Create Balance'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
