'use client';

import { Account } from '@/lib/types';
import { AccountFormData } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountForm } from './account-form';

interface AccountDialogProps {
  open: boolean;
  account?: Account;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
}

export function AccountDialog({
  open,
  account,
  isLoading,
  onOpenChange,
  onSubmit,
}: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Create New Account'}</DialogTitle>
          <DialogDescription>
            {account
              ? 'Update your account details'
              : 'Create a new bank account'}
          </DialogDescription>
        </DialogHeader>
        <AccountForm
          account={account}
          isLoading={isLoading}
          onSubmit={(data) => {
            onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
