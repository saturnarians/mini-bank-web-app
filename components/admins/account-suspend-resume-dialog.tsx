'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Account } from '@/lib/types';

interface AccountSuspendResumeDialogProps {
  account: Account | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'suspend' | 'resume';
  onSuccess?: () => void;
}

export function AccountSuspendResumeDialog({
  account,
  isOpen,
  onOpenChange,
  action,
  onSuccess,
}: AccountSuspendResumeDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const endpoint = action === 'suspend'
        ? `/api/admin/accounts/suspend`
        : `/api/admin/accounts/resume`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} account`);
      }

      setSuccess(true);
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

  const title = action === 'suspend' ? 'Suspend Account' : 'Resume Account';
  const description = action === 'suspend'
    ? 'This will suspend all transactions on this account.'
    : 'This will reactivate the account for transactions.';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                Current Status: {account.status}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (minimum 5 characters)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${action}ing this account...`}
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
                Account {action}ed successfully!
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || reason.length < 5 || success}
                className={action === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {loading ? 'Processing...' : action === 'suspend' ? 'Suspend Account' : 'Resume Account'}
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
