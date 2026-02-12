'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Account } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AddTransactionHistoryDialogProps {
  account: Account | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddTransactionHistoryDialog({
  account,
  isOpen,
  onOpenChange,
  onSuccess,
}: AddTransactionHistoryDialogProps) {
  const [type, setType] = useState<'deposit' | 'withdrawal' | 'transfer' | 'adjustment'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [recipientAccountId, setRecipientAccountId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters');
      return;
    }

    if (type === 'transfer' && !recipientAccountId) {
      setError('Recipient account is required for transfers');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Combine timestamp and time
      const fullTimestamp = new Date(`${timestamp}T${time}:00`).toISOString();

      const response = await fetch('/api/admin/transactions/add-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          type,
          amount: parseFloat(amount),
          description,
          timestamp: fullTimestamp,
          recipientAccountId: type === 'transfer' ? recipientAccountId : undefined,
          reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add transaction history');
      }

      setSuccess(true);
      // Reset form
      setAmount('');
      setDescription('');
      setTimestamp(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setRecipientAccountId('');
      setReason('');
      setType('deposit');

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction History</DialogTitle>
          <DialogDescription>
            Add a historical transaction record to this account
          </DialogDescription>
        </DialogHeader>

        {account && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Info */}
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {account.accountNumber}
              </p>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Transaction Type
              </Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="flex-1"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Recipient Account (for transfers) */}
            {type === 'transfer' && (
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Account ID
                </Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient account ID"
                  value={recipientAccountId}
                  onChange={(e) => setRecipientAccountId(e.target.value)}
                  required={type === 'transfer'}
                />
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason (Required)
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why you are adding this historical transaction..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] resize-none text-xs"
                required
                minLength={5}
              />
              {reason.length > 0 && reason.length < 5 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Reason must be at least 5 characters ({reason.length}/5)
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Transaction history added successfully!
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
                disabled={loading || reason.trim().length < 5 || !amount || parseFloat(amount) <= 0}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
