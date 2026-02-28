"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useCreateTransactionMutation,
  useCreateExternalTransferMutation,
  useLazyGetTransactionsQuery,
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
import { ExternalTransferDialog }from '@/components/user/transactions/external-transfer-dialog';
import type { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  // --- UI STATE (Redux) ---
  const { filters, sortBy, sortOrder } = useAppSelector((state) => state.transactionsUi);
  const { user } = useAppSelector((state) => state.auth);

  // --- LOCAL STATE ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [externalDialogOpen, setExternalDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const { toast } = useToast();

  // --- API ---
  const { data: accounts = [], isLoading: accountsLoading } =
    useGetAccountsQuery({});

  const [fetchTransactions, { isFetching: txFetching, error: txError }] =
    useLazyGetTransactionsQuery();

  const [createTransaction, { isLoading: isSubmitting }] =
    useCreateTransactionMutation();
  
  const [createExternalTransfer, { isLoading: isExternalSubmitting }] =
    useCreateExternalTransferMutation();

  const loadTransactions = async ({ reset = false }: { reset?: boolean } = {}) => {
    if (!selectedAccountId) return;

    try {
      const data = await fetchTransactions(
        {
          accountId: selectedAccountId,
          ...(reset ? {} : nextCursor ? { cursor: nextCursor } : {}),
        },
        false,
      ).unwrap();

      setTransactions((prev) =>
        reset ? data.transactions : [...prev, ...data.transactions],
      );
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // Request errors are surfaced through txError.
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Default account
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      const firstActive = accounts.find((acc) => acc.status === "active");
      setSelectedAccountId(firstActive?.id ?? accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (!selectedAccountId) return;
    setTransactions([]);
    setNextCursor(null);
    setIsInitialLoading(true);
    void loadTransactions({ reset: true });
  }, [selectedAccountId]);

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

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId) ?? null;
  const isSelectedSuspended =
    selectedAccount?.status?.toLowerCase() === "suspended";

  const accountNumberById = useMemo(
    () =>
      Object.fromEntries(
        accounts.map((account) => [account.id, account.accountNumber]),
      ),
    [accounts],
  );

  if (accountsLoading) return <Skeleton className="h-40" />;

  return (
    <div 
    // className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 
    // w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 lg:px-8"
    className=" grid grid-cols-1 md:grid-cols-1 gap-4 
    w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 lg:px-8 "
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:text-left text-center">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold sm:text-3xl">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Ledger-based account activity
          </p>
        </div>

        {selectedAccountId && (
          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <Button
              // size="lg"
              className="flex-1 gap-2 "
              disabled={isSelectedSuspended}
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Local Transaction
            </Button>
            
            <Button
              // size="lg"
              // variant="ghost"
              className="flex-1 gap-2"
              disabled={isSelectedSuspended}
              onClick={() => setExternalDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              International Transaction
            </Button>
          </div>
        )}
      </div>

      {isSelectedSuspended && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 flex-1" />
          <AlertDescription>
            This account is suspended and cannot make transactions. talk to the customer care for help.
          </AlertDescription>
        </Alert>
      )}

      {/* Accounts */}
      {accounts.map((acc) => {
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
            className="flex flex-col items-start justify-between gap-3 rounded border p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <p className="font-semibold wrap-break-word">
                {acc.accountType} — ****{acc.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-muted-foreground">
                Balance: &#36;{
                acc.balance
                .toLocaleString('en-US',
                 { minimumFractionDigits: 2,
                 maximumFractionDigits: 2 })
                 }
              </p>
            </div>

            {/* <Button
            variant="outline"
              onClick={() => {
                setSelectedAccountId(acc.id);
                setDialogOpen(true);
              }}
            >
              Create Transaction
            </Button> */}
          </div>
        );
      })}

      {/* Errors */}
      {txError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 flex-1" />
          <AlertDescription>Failed to load transactions</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 flex-1">
          <TransactionFilters />
        </CardContent>
      </Card>

      {/* Table */}
      {isInitialLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>
              Sorted by {sortBy} ({sortOrder})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 flex-1">
            <div className="overflow-x-auto px-3 pb-3 sm:px-0 sm:pb-0">
              <TransactionTable
                transactions={filteredTransactions}
                accountNumberById={accountNumberById}
                userName={user?.name}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3 pt-4 text-sm text-muted-foreground sm:px-0">
              <p>Loaded {transactions.length} transaction(s)</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadTransactions()}
                disabled={!nextCursor || txFetching}
              >
                {txFetching ? "Loading..." : nextCursor ? "Load more" : "No more transactions"}
              </Button>
            </div>
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
              setIsInitialLoading(true);
              await loadTransactions({ reset: true });
              setDialogOpen(false);
            } catch (error: any) {
              const message =
                error?.data?.message ||
                error?.data?.error ||
                "Transaction failed";
              toast({
                title: "Transaction failed",
                description: message,
                variant: "destructive",
              });
            }
          }}
        />
      )}
      {selectedAccountId && (
        <ExternalTransferDialog
          open={externalDialogOpen}
          accountId={selectedAccountId}
          isLoading={isExternalSubmitting}
          onOpenChange={setExternalDialogOpen}
          onSubmit={async ({ data, accountId }) => {
            try {
              await createExternalTransfer({
                ...data,
                accountId: accountId,
              }).unwrap();

              toast({
                title: "External Transfer created",
                description: "Transfer completed successfully",
              });
              setIsInitialLoading(true);
              await loadTransactions({ reset: true });
              setExternalDialogOpen(false);
            } catch (error: any) {
              const message =
                error?.data?.message ||
                error?.data?.error ||
                "Transaction failed";
              toast({
                title: "Transaction failed",
                description: message,
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  );
}

