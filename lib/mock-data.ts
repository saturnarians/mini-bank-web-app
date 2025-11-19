import { User, Account, Transaction } from '@/lib/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@bank.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+1-555-0100',
    address: '123 Main St, City, State',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@bank.com',
    name: 'Manager User',
    role: 'manager',
    phone: '+1-555-0101',
    address: '456 Oak Ave, City, State',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    phone: '+1-555-0102',
    address: '789 Pine Rd, City, State',
    createdAt: new Date().toISOString(),
  },
];

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    userId: '3',
    accountNumber: '1234567890',
    accountType: 'checking',
    balance: 5200.50,
    currency: 'USD',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastTransactionAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    userId: '3',
    accountNumber: '0987654321',
    accountType: 'savings',
    balance: 15000.00,
    currency: 'USD',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    accountId: 'acc-1',
    type: 'deposit',
    amount: 1000.00,
    currency: 'USD',
    status: 'completed',
    description: 'Direct deposit salary',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reference: 'DEP-2024-001',
  },
  {
    id: 'txn-2',
    accountId: 'acc-1',
    type: 'withdrawal',
    amount: 200.00,
    currency: 'USD',
    status: 'completed',
    description: 'ATM withdrawal',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    reference: 'WTH-2024-001',
  },
  {
    id: 'txn-3',
    accountId: 'acc-1',
    type: 'transfer',
    amount: 500.00,
    currency: 'USD',
    status: 'completed',
    description: 'Transfer to savings',
    recipientAccountId: 'acc-2',
    recipientName: 'Savings Account',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    reference: 'TRF-2024-001',
  },
];
