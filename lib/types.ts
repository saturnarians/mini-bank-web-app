import { TransactionFormData } from '@/lib/schemas';

// -------------------- Roles --------------------
export type UserRole = 'superadmin' | 'admin' | 'user';

//Account Status Types (System intention  )
export type AccountStatus = 'active' | 'inactive' | 'failed' | 'suspended';

// Account Types (Business intention  )
export type AccountType =  'checking' | 'savings' | 'investment';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';

export type TransactionApprovalStatus = 'pending' | 'approved' | 'rejected';


export type CreateTransactionPayload = TransactionFormData & {
  accountId: string; // source account
};

export type TransactionDirection = 'in' | 'out';


// -------------------- Account --------------------
export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  // accountId: string;
  accountType: AccountType;
  balance: number;
  currency: 'USD';
  status: AccountStatus;
  createdAt: string;
  lastTransactionAt?: string;
  logs?: AccountLog[];
  suspensionAt?: string;
  suspensionReason?: string;
  updatedAt?: string;
  // Admin view: includes user relationship for display
  user?: {
    id: string;
    name: string;
    email: string;
  };
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

//--------------Shared payload---------

// -------------------- Transaction --------------------
export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number; // +credit, -debit
  currency: 'USD';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  recipientAccountId?: string;
  recipientName?: string;
  timestamp: string;
  reference: string;
  runningBalance: number;
  direction: TransactionDirection;
  approvalStatus?: TransactionApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface externalTransaction {
  amount: number; 
  recipientName: string;
  recipientBank: string; 
  recipientAccountNumber: number; 
  description?: string;
  swiftCode?: string;
  iban?: string;
  routingNumber?: number;
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
