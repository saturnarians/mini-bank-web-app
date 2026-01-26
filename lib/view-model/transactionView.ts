export type TransactionDirection = 'in' | 'out';

export type TransactionView = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';

  amount: number;
  direction: TransactionDirection;

  description: string;
  status: 'completed' | 'pending' | 'failed';

  counterparty?: string;
  // {
  //   accountId: string;
  //   accountNumber: string;
  //   accountType: string;
  // };

  timestamp: string;
};
