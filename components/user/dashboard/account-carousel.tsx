"use client";

import { Account } from '@/lib/types';
import { AccountCard } from '@/components/user/account-card';

interface AccountCarouselProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (accountId: string) => void;
}

export function AccountCarousel({ accounts, onEdit, onDelete }: AccountCarouselProps) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-4 w-max">
        {accounts.map((acc) => (
          <div key={acc.id} className="w-72">
            <AccountCard account={acc} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}