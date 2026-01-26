import { Transaction } from "@/lib/types";

/**
 * Ledger-based balance computation
 * Source of truth: transactions only
 */
export function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (tx.status !== "completed") return sum;
    return sum + tx.amount;
  }, 0);
};