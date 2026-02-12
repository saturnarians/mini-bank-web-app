import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalTransferForm } from './external-transfer-form';
import { ExternalTransferFormData } from '@/lib/schemas';

interface ExternalTransferDialogProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onSubmit: (data: { data: ExternalTransferFormData; accountId: string }) => void;
  // defaultAccountId: string;
  // onSuccess?: () => void;
}

export function ExternalTransferDialog({
  accountId,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ExternalTransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>External Transfer</DialogTitle>
          <DialogDescription>
            Send money to other banks
          </DialogDescription>
        </DialogHeader>

        <ExternalTransferForm 
          isLoading={isLoading}
          onSubmit={async (data) => {
            console.log('SUBMITTED', data);
            await onSubmit({
              data,
              accountId
            });
            onOpenChange(false);
          }} // Handled in parent
          onCancel={() => onOpenChange(false)}
          // defaultAccountId={accountId} 
          // onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
