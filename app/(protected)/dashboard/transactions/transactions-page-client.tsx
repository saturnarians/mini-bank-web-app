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
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TransactionsPage() {
  const normalizeStatus = (status?: string | null) =>
    (status ?? "").trim().toLowerCase();

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
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [newTransactionPin, setNewTransactionPin] = useState("");
  const [confirmTransactionPin, setConfirmTransactionPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<any>(null);
  
  const { toast } = useToast();

  // --- API ---
  const { data: accounts = [], isLoading: accountsLoading } =
    useGetAccountsQuery(
      {},
      { refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true }
    );

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
      const firstActive = accounts.find(
        (acc) => normalizeStatus(acc.status) === "active",
      );
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
  const isUserSuspended = normalizeStatus(user?.status) === "suspended";
  const isSelectedSuspended =
    normalizeStatus(selectedAccount?.status) === "suspended";
  const isTransactionBlocked = isUserSuspended || isSelectedSuspended;

  const accountNumberById = useMemo(
    () =>
      Object.fromEntries(
        accounts.map((account) => [account.id, account.accountNumber]),
      ),
    [accounts],
  );

  if (accountsLoading) return <Skeleton className="h-40" />;

  const handleSetTransactionPin = async () => {
    if (!/^\d{4}$/.test(newTransactionPin)) {
      toast({
        title: "Invalid PIN",
        description: "Transaction PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    if (newTransactionPin !== confirmTransactionPin) {
      toast({
        title: "PIN mismatch",
        description: "New PIN and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSettingPin(true);
    try {
      const response = await fetch("/api/auth/transaction-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newPin: newTransactionPin,
          confirmNewPin: confirmTransactionPin,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to set transaction PIN.");
      }

      toast({
        title: "PIN saved",
        description: "Your transaction PIN has been created successfully.",
      });
      setPinSetupOpen(false);
      setNewTransactionPin("");
      setConfirmTransactionPin("");
    } catch (error: any) {
      toast({
        title: "PIN setup failed",
        description: error?.message || "Could not create transaction PIN.",
        variant: "destructive",
      });
    } finally {
      setIsSettingPin(false);
    }
  };

  const handleDownloadReceiptPdf = () => {
    if (!receiptTransaction) return;

    const doc = new jsPDF();
    const amount = Number(receiptTransaction?.amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const dateText = receiptTransaction?.timestamp
      ? new Date(receiptTransaction.timestamp).toLocaleString()
      : new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Mini Bank - Transaction Receipt", 14, 20);
    doc.setFontSize(12);
    doc.text(`Reference: ${receiptTransaction?.reference || "N/A"}`, 14, 35);
    doc.text(`Type: ${receiptTransaction?.type || "N/A"}`, 14, 45);
    doc.text(`Amount: $${amount}`, 14, 55);
    doc.text(`Status: ${receiptTransaction?.status || "completed"}`, 14, 65);
    doc.text(`Date: ${dateText}`, 14, 75);
    doc.text(`Description: ${receiptTransaction?.description || "N/A"}`, 14, 85);

    const fileRef = receiptTransaction?.reference || `receipt-${Date.now()}`;
    doc.save(`${fileRef}.pdf`);
  };

  const handlePrintReceipt = () => {
    if (!receiptTransaction) return;

    const amount = Number(receiptTransaction?.amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const dateText = receiptTransaction?.timestamp
      ? new Date(receiptTransaction.timestamp).toLocaleString()
      : new Date().toLocaleString();

    const popup = window.open("", "_blank", "width=700,height=900");
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 16px; }
            p { margin: 8px 0; font-size: 14px; }
            .label { font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Mini Bank - Transaction Receipt</h1>
          <p><span class="label">Reference:</span> ${receiptTransaction?.reference || "N/A"}</p>
          <p><span class="label">Type:</span> ${receiptTransaction?.type || "N/A"}</p>
          <p><span class="label">Amount:</span> $${amount}</p>
          <p><span class="label">Status:</span> ${receiptTransaction?.status || "completed"}</p>
          <p><span class="label">Date:</span> ${dateText}</p>
          <p><span class="label">Description:</span> ${receiptTransaction?.description || "N/A"}</p>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

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
              disabled={isTransactionBlocked}
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Local Transaction
            </Button>
            
            <Button
              // size="lg"
              // variant="ghost"
              className="flex-1 gap-2"
              disabled={isTransactionBlocked}
              onClick={() => setExternalDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              International Transaction
            </Button>
          </div>
        )}
      </div>

      {isUserSuspended && (
        <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 flex-1" />
          <AlertDescription className="font-bold text-red-700 dark:text-red-300">
            USER ACCOUNT SUSPENDED: This user cannot make any transaction. Contact support to reactivate it.
          </AlertDescription>
        </Alert>
      )}

      {!isUserSuspended && isSelectedSuspended && (
        <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 flex-1" />
          <AlertDescription className="font-bold text-red-700 dark:text-red-300">
            ACCOUNT SUSPENDED: This account cannot make any transaction. Contact support to reactivate it.
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
            onClick={() => setSelectedAccountId(acc.id)}
            className={`flex cursor-pointer flex-col items-start justify-between gap-3 rounded border p-4 sm:flex-row sm:items-center ${
              selectedAccountId === acc.id ? "border-primary bg-primary/5" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="font-semibold wrap-break-word">
                {acc.accountType} — ****{acc.accountNumber.slice(-4)}
              </p>
              {normalizeStatus(acc.status) === "suspended" ? (
                <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                  Suspended
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Balance: &#36;{
                acc.balance
                .toLocaleString('en-US',
                 { minimumFractionDigits: 2,
                 maximumFractionDigits: 2 })
                 }
              </p>
            </div>
            <Button
              variant={selectedAccountId === acc.id ? "default" : "outline"}
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedAccountId(acc.id);
              }}
            >
              {selectedAccountId === acc.id ? "Selected" : "View Activity"}
            </Button>

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
              const created = await createTransaction({
                ...data,
                accountId,
              }).unwrap();

              const tx = (created as any)?.senderTx ?? created;
              setReceiptTransaction(tx);
              setReceiptOpen(true);

              toast({
                title: "Transaction created",
                description: "Ledger updated successfully",
              });
              setIsInitialLoading(true);
              await loadTransactions({ reset: true });
              setDialogOpen(false);
            } catch (error: any) {
              if (error?.data?.error === "TRANSACTION_PIN_NOT_SET") {
                setPinSetupOpen(true);
                toast({
                  title: "Create transaction PIN",
                  description:
                    error?.data?.message || "Set your transaction PIN before sending money.",
                });
                return;
              }

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
              const created = await createExternalTransfer({
                ...data,
                accountId: accountId,
              }).unwrap();

              const tx = (created as any)?.transfer ?? created;
              setReceiptTransaction(tx);
              setReceiptOpen(true);

              toast({
                title: "External Transfer created",
                description: "Transfer completed successfully",
              });
              setIsInitialLoading(true);
              await loadTransactions({ reset: true });
              setExternalDialogOpen(false);
            } catch (error: any) {
              if (error?.data?.error === "TRANSACTION_PIN_NOT_SET") {
                setPinSetupOpen(true);
                toast({
                  title: "Create transaction PIN",
                  description:
                    error?.data?.message || "Set your transaction PIN before sending money.",
                });
                return;
              }

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

      <Dialog open={pinSetupOpen} onOpenChange={setPinSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Transaction PIN</DialogTitle>
            <DialogDescription>
              You need a transaction PIN before you can send money.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-transaction-pin">New PIN</Label>
              <Input
                id="new-transaction-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={newTransactionPin}
                onChange={(event) => setNewTransactionPin(event.target.value.replace(/\D/g, ""))}
                disabled={isSettingPin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-transaction-pin">Confirm PIN</Label>
              <Input
                id="confirm-transaction-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Repeat PIN"
                value={confirmTransactionPin}
                onChange={(event) => setConfirmTransactionPin(event.target.value.replace(/\D/g, ""))}
                disabled={isSettingPin}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPinSetupOpen(false)}
              disabled={isSettingPin}
            >
              Cancel
            </Button>
            <Button onClick={handleSetTransactionPin} disabled={isSettingPin}>
              {isSettingPin ? "Saving..." : "Save PIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
            <DialogDescription>Transaction completed successfully.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><strong>Reference:</strong> {receiptTransaction?.reference || "N/A"}</p>
            <p><strong>Type:</strong> {receiptTransaction?.type || "N/A"}</p>
            <p><strong>Amount:</strong> ${Number(receiptTransaction?.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Status:</strong> {receiptTransaction?.status || "completed"}</p>
            <p><strong>Date:</strong> {receiptTransaction?.timestamp ? new Date(receiptTransaction.timestamp).toLocaleString() : new Date().toLocaleString()}</p>
            {receiptTransaction?.description ? (
              <p><strong>Description:</strong> {receiptTransaction.description}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrintReceipt}>
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadReceiptPdf}>
              Download PDF
            </Button>
            <Button onClick={() => setReceiptOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
