// Type definitions for the banking application

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: 'USD';
  status: 'active' | 'inactive' | 'closed';
  createdAt: string;
  lastTransactionAt?: string;
}

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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
}

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  accounts: AccountsState;
  transactions: TransactionsState;
  users: UsersState;
}
