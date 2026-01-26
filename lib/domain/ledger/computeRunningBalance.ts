import { Transaction } from "@/lib/domain/types";

export function computeRunningBalances(
  startingBalance: number,
  transactions: Transaction[]
): Transaction[] {
  let balance = startingBalance;

  return transactions.map((tx) => {
    balance += tx.amount;
    return {
      ...tx,
      runningBalance: balance,
    };
  });
}
