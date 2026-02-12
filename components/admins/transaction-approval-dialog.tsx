'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Transaction } from '@/lib/types';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface TransactionApprovalDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'approve' | 'reject';
  onSuccess?: () => void;
}

export function TransactionApprovalDialog({
  transaction,
  isOpen,
  onOpenChange,
  action,
  onSuccess,
}: TransactionApprovalDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    // Validate rejection reason
    if (action === 'reject' && reason.trim().length < 5) {
      setError('Rejection reason must be at least 5 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const endpoint = action === 'approve'
        ? `/api/admin/transactions/approve`
        : `/api/admin/transactions/reject`;

      const body = action === 'approve'
        ? { transactionId: transaction.id, reason }
        : { transactionId: transaction.id, rejectionReason: reason };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} transaction`);
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

  const title = action === 'approve' ? 'Approve Transaction' : 'Reject Transaction';
  const description = action === 'approve'
    ? 'This will approve the transaction and process it.'
    : 'This will reject the transaction permanently.';

  const buttonColor = action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {transaction && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Details */}
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <p className="mb-2 text-sm font-semibold">Transaction Details</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="font-medium capitalize">{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Description:</span>
                  <span className="font-medium">{transaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Reference:</span>
                  <span className="font-mono text-xs">{transaction.reference}</span>
                </div>
                {action === 'reject' && (
                  <div className="mt-3 flex gap-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      This action cannot be undone.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reason/Explanation */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  action === 'approve'
                    ? 'Add any notes for the transaction approval...'
                    : 'Explain why you are rejecting this transaction...'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px] resize-none"
                required={action === 'reject'}
                minLength={action === 'reject' ? 5 : 0}
              />
              {action === 'reject' && reason.length > 0 && reason.length < 5 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Reason must be at least 5 characters ({reason.length}/5)
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Transaction {action === 'approve' ? 'approved' : 'rejected'} successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (action === 'reject' && reason.trim().length < 5)}
                className={`flex-1 text-white ${buttonColor}`}
              >
                {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
