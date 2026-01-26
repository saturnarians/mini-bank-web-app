'use client';

import { TransactionFormData } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionForm } from './transaction-form';

interface TransactionDialogProps {
  open: boolean;
  accountId: string; // Provided by parent, do NOT include in form submission
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {data:TransactionFormData, accountId: string}) => void;
}

export function TransactionDialog({
  open,
  accountId,
  isLoading,
  onOpenChange,
  onSubmit,
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction for your account
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
          // Only form fields, accountId is passed separately
          isLoading={isLoading}
          onSubmit={(data) => {
            onSubmit({
              data, 
              accountId
            }); // Merge accountId in parent handler
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
