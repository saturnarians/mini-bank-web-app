'use client';

import { User } from '@/lib/types';
import { UserFormData } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './user-form';

interface UserDialogProps {
  open: boolean;
  user?: User;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
}

export function UserDialog({
  open,
  user,
  isLoading,
  onOpenChange,
  onSubmit,
}: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Update user details and role'
              : 'Add a new user to the system'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
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
