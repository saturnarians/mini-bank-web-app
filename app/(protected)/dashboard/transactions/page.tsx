"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useCreateTransactionMutation,
  useGetTransactionsQuery,
} from "@/store/services/transactionsApi";
import { useGetAccountsQuery } from "@/store/services/accountsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/user/transactions/transaction-table";
import { TransactionDialog } from "@/components/user/transactions/transaction-dialog";
import { TransactionFilters } from "@/components/user/transactions/transaction-filters";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { computeBalance } from "@/lib/domain/ledger/computeBalance";

export default function TransactionsPage() {
  // --- UI STATE (Redux) ---
  const { filters, sortBy, sortOrder } = useAppSelector(
    (state) => state.transactionsUi,
  );

  // --- LOCAL STATE ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();

  // --- API ---
  const { data: accounts = [], isLoading: accountsLoading } =
    useGetAccountsQuery({});

  const {
    data: transactionsData,
    isLoading: txLoading,
    error: txError,
  } = useGetTransactionsQuery(
    { accountId: selectedAccountId! },
    { skip: !selectedAccountId },
  );

  const [createTransaction, { isLoading: isSubmitting }] =
    useCreateTransactionMutation();

  // --- DERIVED ---
  const transactions = transactionsData?.transactions ?? [];
  
  // 1. Calculate the Grand Total using the raw transactions array
const totalBalance = useMemo(() => {
  // Pass the ARRAY here, not the map.
  return computeBalance(transactions);
}, [transactions]);

// 2. Group transactions for individual accounts (Syncing logic with computeBalance)
const balancesByAccountId = useMemo(() => {
  const map: Record<string, number> = {};

  for (const tx of transactions) {
    // We add this check to match what computeBalance is doing!
    if (tx.status !== "completed") continue; 
    
    map[tx.accountId] = (map[tx.accountId] ?? 0) + tx.amount;
  }

  return map;
}, [transactions]);

  // Default account
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // --- FILTER + SORT ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filters.type && tx.type !== filters.type) return false;
        if (filters.status && tx.status !== filters.status) return false;
        if (
          filters.dateFrom &&
          new Date(tx.timestamp) < new Date(filters.dateFrom)
        )
          return false;
        if (filters.dateTo && new Date(tx.timestamp) > new Date(filters.dateTo))
          return false;
        return true;
      })
      .sort((a, b) => {
        const compare =
          sortBy === "amount"
            ? a.amount - b.amount
            : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortOrder === "asc" ? compare : -compare;
      });
  }, [transactions, filters, sortBy, sortOrder]);

  if (accountsLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Ledger-based account activity
          </p>
        </div>

        {selectedAccountId && (
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        )}
      </div>

      {/* Accounts */}
      {accounts.map((acc) => {
        const balance = balancesByAccountId[acc.id] ?? 0;
        /*
        If you ever need multi-currency later, this evolves into:

new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
}).format(balance)
        */

        return (
          <div
            key={acc.id}
            className="flex justify-between items-center border p-4 rounded"
          >
            <div>
              <p className="font-semibold">
                {acc.accountType} — ****{acc.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-muted-foreground">
                {/* Display as $0.00 format */}
                Balance: &#36;{
                balance
                .toLocaleString('en-US',
                 { minimumFractionDigits: 2,
                 maximumFractionDigits: 2 })
                 }
              </p>
            </div>

            <Button
            variant="outline"
              onClick={() => {
                setSelectedAccountId(acc.id);
                setDialogOpen(true);
              }}
            >
              Create Transaction
            </Button>
          </div>
        );
      })}

      {/* Errors */}
      {txError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load transactions</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <TransactionFilters />
        </CardContent>
      </Card>

      {/* Table */}
      {txLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>
              Sorted by {sortBy} ({sortOrder})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={filteredTransactions} />
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      {selectedAccountId && (
        <TransactionDialog
          open={dialogOpen}
          accountId={selectedAccountId}
          isLoading={isSubmitting}
          onOpenChange={setDialogOpen}
          onSubmit={async ({ data, accountId }) => {
            try {
              await createTransaction({
                ...data,
                accountId,
              }).unwrap();

              toast({
                title: "Transaction created",
                description: "Ledger updated successfully",
              });
              setDialogOpen(false);
            } catch {
              toast({
                title: "Transaction failed",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  );
}
