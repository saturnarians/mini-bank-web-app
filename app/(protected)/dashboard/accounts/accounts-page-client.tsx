'use client';

import { useGetAccountsQuery } from '@/store/services/accountsApi';
import { useAdjustBalanceMutation } from '@/store/services/adminTransactionsApi';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AccountsPageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const { data: accounts = [], isLoading } = useGetAccountsQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const [adjustBalance] = useAdjustBalanceMutation();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  if (isLoading) return <p>Loading accounts...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Accounts</h1>

      {accounts.length === 0 && <p className="text-muted">No accounts yet.</p>}

      {accounts.map((acc) => (
        <div
          key={acc.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {acc.accountType} - ****{acc.accountNumber.slice(-4)}
            </p>
            <p>Balance: ${acc.balance.toLocaleString()}</p>
            <p>Status: {acc.status}</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setSelectedAccountId(acc.id)}
              className="px-3 py-1 bg-black text-white rounded"
            >
              Adjust Balance
            </button>
          )}
        </div>
      ))}

      {selectedAccountId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded space-y-3 w-96">
            <h2 className="font-bold">Adjust Balance</h2>

            <input
              type="number"
              placeholder="Amount (+ / -)"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border p-2"
            />

            <input
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-2"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedAccountId(null)}
                className="px-3 py-1 border"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await adjustBalance({
                    accountId: selectedAccountId,
                    amount,
                    reason,
                  });
                  setSelectedAccountId(null);
                  setAmount(0);
                  setReason('');
                }}
                className="px-3 py-1 bg-black text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
