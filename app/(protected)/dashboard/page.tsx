'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAccounts } from '@/store/slices/accounts-slice';
import { fetchTransactions } from '@/store/slices/transactions-slice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from 'recharts';
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  // BanknoteArrowDown,
  HandCoins, 
  Landmark,
  Banknote,
} from 'lucide-react';
import { AccountCarousel } from '@/components/user/dashboard/account-carousel';
import { RecentTransactions } from '@/components/user/dashboard/recent-transactions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { accounts, isLoading: accountsLoading } = useAppSelector(state => state.accounts);
  const { transactions, isLoading: transactionsLoading } = useAppSelector(state => state.transactions);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const recentTransactions = transactions.slice(0, 5);

  // Generate mock chart data
  // const chartData = Array.from({ length: 7 }).map((_, i) => ({
  //   day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  //   balance: Math.floor(Math.random() * 20000) + 5000,
  //   transactions: Math.floor(Math.random() * 15) + 2,
  // }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium ">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-2xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs  mt-1">Across all accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Active Accounts</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-2xl font-bold">{activeAccounts}</p>
                <p className="text-xs  mt-1">{accounts.length} total accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Transactions History</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-xs  mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Account Status</span>
              <Wallet className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Active</p>
            <p className="text-xs  mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Same Bank Transfer</span>
              <Banknote color="green" size={32} className="h-4 w-4 text-primary"/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Send</p>
            <p className="text-xs  mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Other Bank Transfer</span>
             <Landmark color="blue" size={32} className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Send</p>
            <p className="text-xs  mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="glass shadow-custom">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium ">Loans</span>
               {/* <BanknoteArrowDown size={24} color="#000" /> */}
               <HandCoins size={24} color="#000" className="h-4 w-4 text-primary relative left-16"/>
               <Landmark size={24} color="#000" className="h-4 w-4 text-primary"/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <p className="text-2xl font-bold text-green-600">Active</p> */}
            <p className="text-xs  mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Account carousel (compact account cards) */}
      <div>
        <AccountCarousel accounts={accounts} />
      </div>

      {/* Charts */}
       {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass shadow-custom">
          <CardHeader>
            <CardTitle>Balance Trend</CardTitle>
            <CardDescription>Last 7 days balance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

        {/* <Card className="glass shadow-custom">
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Transactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="transactions" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> 
      </div>*/}

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
            <Link href="/dashboard/accounts" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                View Accounts
              </Button>
            </Link>
            <Link href="/dashboard/transactions" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </Link>
            <Link href="/dashboard/accounts?action=create" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
