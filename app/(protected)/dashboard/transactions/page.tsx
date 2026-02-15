"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useCreateTransactionMutation,
  useCreateExternalTransferMutation,
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
import { ExternalTransferDialog }from '@/components/user/transactions/external-transfer-dialog';

export default function TransactionsPage() {
  // --- UI STATE (Redux) ---
  const { filters, sortBy, sortOrder } = useAppSelector((state) => state.transactionsUi);

  // --- LOCAL STATE ---
  const [dialogOpen, setDialogOpen] = useState(false);
   const [externalDialogOpen, setExternalDialogOpen] = useState(false);
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
  } = useGetTransactionsQuery();

  const [createTransaction, { isLoading: isSubmitting }] =
    useCreateTransactionMutation();
  
  const [createExternalTransfer, { isLoading: isExternalSubmitting }] =
    useCreateExternalTransferMutation();

  // --- DERIVED ---
  const transactions = transactionsData?.transactions ?? [];
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
      const firstActive = accounts.find((acc) => acc.status === "active");
      setSelectedAccountId(firstActive?.id ?? accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // --- FILTER + SORT ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Filter by selected account
        if (selectedAccountId && tx.accountId !== selectedAccountId) return false;
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
  }, [transactions, filters, sortBy, sortOrder, selectedAccountId]);

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId) ?? null;
  const isSelectedSuspended =
    selectedAccount?.status?.toLowerCase() === "suspended";

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
            className="flex flex-col items-start justify-between gap-3 rounded border p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <p className="font-semibold wrap-break-word">
                {acc.accountType} — ****{acc.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-muted-foreground">
                {/* Display as $0.00 format */}
                Total Transaction: &#36;{
                balance
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
          <CardContent className="p-0 sm:p-6 flex-1">
            <div className="overflow-x-auto px-3 pb-3 sm:px-0 sm:pb-0">
              <TransactionTable transactions={filteredTransactions} />
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

