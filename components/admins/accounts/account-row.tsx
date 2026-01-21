import { Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  useSuspendAccountMutation,
  useResumeAccountMutation,
} from '@/store/services/accountsApi';
import { useAppSelector } from '@/store/hooks';

interface AccountRowProps {
  account: Account;
}

export default function AccountRow({ account }: AccountRowProps) {
  const { user } = useAppSelector((s) => s.auth);

  const [suspendAccount, suspendState] = useSuspendAccountMutation();
  const [resumeAccount, resumeState] = useResumeAccountMutation();

  /* ================= RBAC ================= */
  const isAdmin =
    user?.role === 'admin' || user?.role === 'superadmin';

  /* ================= State Guards ================= */
  const canSuspend = isAdmin && account.status === 'active';
  const canResume = isAdmin && account.status === 'suspended';

  const isLoading = suspendState.isLoading || resumeState.isLoading;

  /* ================= Helpers ================= */
  const latestLog = account.logs?.[0];

  const requestReason = (action: 'suspend' | 'resume') => {
    const label =
      action === 'suspend'
        ? 'Reason for suspension'
        : 'Reason for resuming';
    return prompt(label);
  };

  const handleAction = async (
    action: 'suspend' | 'resume'
  ) => {
    const reason = requestReason(action);
    if (!reason) return;

    try {
      if (action === 'suspend') {
        await suspendAccount({
          id: account.id,
          reason,
        }).unwrap();
      } else {
        await resumeAccount({
          id: account.id,
          reason,
        }).unwrap();
      }
    } catch {
      alert(`Failed to ${action} account`);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">
            {account.accountNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {account.accountType.toUpperCase()} ·{' '}
            {account.currency}
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

      {/* Suspension / Resume Log */}
      {account.status === 'suspended' && latestLog && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
          <strong>Reason:</strong> {latestLog.reason}
          <div className="text-xs text-gray-500 mt-1">
            {new Date(
              latestLog.createdAt
            ).toLocaleString()}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex gap-2 pt-2">
          {canSuspend && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoading}
              onClick={() => handleAction('suspend')}
            >
              {suspendState.isLoading
                ? 'Suspending...'
                : 'Suspend'}
            </Button>
          )}

          {canResume && (
            <Button
              variant="default"
              size="sm"
              disabled={isLoading}
              onClick={() => handleAction('resume')}
            >
              {resumeState.isLoading
                ? 'Resuming...'
                : 'Resume'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
