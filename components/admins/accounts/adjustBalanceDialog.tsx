"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdjustBalanceMutation } from "@/store/services/adminTransactionsApi";

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  accountId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accountId: string;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [adjustBalance, { isLoading }] = useAdjustBalanceMutation();

  const submit = async () => {
    await adjustBalance({
      accountId,
      amount: Number(amount),
      reason,
    }).unwrap();

    onOpenChange(false);
    setAmount("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Account Balance</DialogTitle>
        </DialogHeader>

        <Input
          type="number"
          placeholder="Amount (+ or -)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Textarea
          placeholder="Reason (required for audit)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Button
          disabled={isLoading || reason.trim().length < 5}
          onClick={submit}
        >
          Confirm Adjustment
        </Button>
      </DialogContent>
    </Dialog>
  );
}
