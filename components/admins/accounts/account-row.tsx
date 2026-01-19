import { Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useSuspendAccountMutation } from '@/store/services/accountsApi';

export default function AccountRow({
  account,
  isAdmin = false,
}: {
  account: Account;
  isAdmin?: boolean;
}) {
  const [suspendAccount, { isLoading }] = useSuspendAccountMutation();

  const handleSuspend = async () => {
    const reason = prompt('Reason for suspension');
    if (!reason) return;

    try {
      await suspendAccount({ id: account.id, reason }).unwrap();
    } catch {
      alert('Failed to suspend account');
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{account.accountNumber}</h3>
          <p className="text-sm text-gray-500">
            {account.accountType.toUpperCase()} · {account.currency}
          </p>
        </div>

        <span
          className={`text-sm font-medium ${
            account.status === 'suspended'
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {account.status}
        </span>
      </div>

      {/* Suspension log */}
      {account.status === 'suspended' && account.logs?.[0] && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
          <strong>Suspended Reason:</strong> {account.logs[0].reason}
          <div className="text-xs text-gray-500 mt-1">
            By {account.logs[0].adminEmail} ·{' '}
            {new Date(account.logs[0].createdAt).toLocaleString()}
          </div>
        </div>
      )}

      {isAdmin && account.status === 'active' && (
        <div className="pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSuspend}
            disabled={isLoading}
          >
            {isLoading ? 'Suspending...' : 'Suspend Account'}
          </Button>
        </div>
      )}
    </div>
  );
}
