export type Account = {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  status: "active" | "suspended";
  createdAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;

  amount: number; // +credit / -debit
  type: "transfer" | "deposit" | "withdrawal" | "adjustment";

  status: "completed" | "pending" | "failed";

  reason?: string; // REQUIRED for adjustment
  metadata?: {
    adjustedByAdminId?: string;
    adjustedByAdminEmail?: string;
    ipAddress?: string;
  };

  runningBalance: number; // computed on write
  createdAt: string;
};

export type BalanceSnapshot = {
  id: string;
  accountId: string;
  balance: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
};
