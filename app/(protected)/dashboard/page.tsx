'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountCarousel } from '@/components/user/dashboard/account-carousel';
import { RecentTransactions } from '@/components/user/dashboard/recent-transactions';
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  HandCoins, 
  Landmark,
  Banknote,
} from 'lucide-react';

import { useGetAccountsQuery } from '@/store/services/accountsApi';
import { useGetTransactionsQuery } from '@/store/services/transactionsApi';
// import { transaction } from '@/lib/types';
import { BaseProfile } from "@/components/shared/baseProfile";

export default function DashboardPage() {
  // RTK Query hooks
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccountsQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery({});

  const transactions = transactionsData?.transactions || [];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-2xl font-bold">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-1">Across all accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Accounts</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-2xl font-bold">{activeAccounts}</p>
                <p className="text-xs mt-1">{accounts.length} total accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium">Transactions History</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-xs mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status</span>
              <Wallet className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Active</p>
            <p className="text-xs mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Account carousel */}
      <div>
        <AccountCarousel accounts={accounts} />
      </div>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={recentTransactions} isLoading={transactionsLoading} />
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/accounts">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                View Accounts
              </Button>
            </Link>
            <Link href="/dashboard/transactions">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </Link>
            <Link href="/dashboard/accounts?action=create">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
            <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <p className="text-gray-500 mb-8">Manage your profile and security settings below.</p>
      
      <BaseProfile />
    </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
