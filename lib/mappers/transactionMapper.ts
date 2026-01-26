import { Transaction } from '@/lib/types';
import { TransactionView } from '@/lib/view-model/transactionView';

export function mapTransactionToView(
  tx: Transaction,
  currentAccountId: string,
): TransactionView {

  const isIncoming = tx.recipientAccountId === currentAccountId;

  const counterpartyAccountId = isIncoming
    ? tx.accountId
    : tx.recipientAccountId;

  return {
    id: tx.id,
    description: tx.description,
    type: tx.type,
    direction: tx.direction,
    counterparty: counterpartyAccountId
      ? `Account ****${counterpartyAccountId.slice(-4)}`
      : 'System',
    amount: isIncoming ? tx.amount : -tx.amount,
    status: tx.status,
    timestamp: tx.timestamp,
  };
}
