// -------------------- Roles --------------------
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'user';

// -------------------- Account --------------------
export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: 'USD';
  status: 'active' | 'inactive' | 'closed' | 'suspended';
  createdAt: string;
  lastTransactionAt?: string;
  logs?: AccountLog[];
}

// -------------------- Account Log --------------------
export type AccountLog = {
  id: string;
  accountId: string;
  action: string;
  reason: string | null;
  performedBy: string;
  createdAt: string;
};

// -------------------- User --------------------
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string;
  address?: string;
  accounts?: Account[];
  createdAt: string;
}

// -------------------- Transaction --------------------
export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: 'USD';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  recipientAccountId?: string;
  recipientName?: string;
  timestamp: string;
  reference: string;
}

// -------------------- Redux States --------------------
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
}

export interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: 'deposit' | 'withdrawal' | 'transfer';
    status?: 'completed' | 'pending' | 'failed';
    dateFrom?: string;
    dateTo?: string;
  };
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

// Root state
export interface RootState {
  auth: AuthState;
  accounts: AccountsState;
  transactions: TransactionsState;
  users: UsersState;
}
