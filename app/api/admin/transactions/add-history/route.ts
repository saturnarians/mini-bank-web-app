import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addTransactionHistorySchema = z.object({
  accountId: z.string(),
  type: z.enum(['deposit', 'withdrawal', 'transfer', 'adjustment']),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  timestamp: z.string().datetime("Invalid date"),
  recipientAccountId: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const POST = authorize(
  ["admin", "superadmin"],
  async (req, { session }) => {
    try {
      const body = await req.json();
      const data = addTransactionHistorySchema.parse(body);

      // Verify account exists
      const account = await prisma.account.findUnique({
        where: { id: data.accountId },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      // Handle transfer validation
      if (data.type === 'transfer' && data.recipientAccountId) {
        const recipient = await prisma.account.findUnique({
          where: { id: data.recipientAccountId },
        });

        if (!recipient) {
          return NextResponse.json(
            { error: "Recipient account not found" },
            { status: 404 }
          );
        }

        if (data.recipientAccountId === data.accountId) {
          return NextResponse.json(
            { error: "Cannot transfer to the same account" },
            { status: 400 }
          );
        }
      }

      // Create the historical transaction within a transaction
      const transaction = await prisma.$transaction(async (tx) => {
        // Create the transaction record
        const txRecord = await tx.transaction.create({
          data: {
            accountId: data.accountId,
            type: data.type,
            amount: data.amount,
            description: data.description,
            timestamp: new Date(data.timestamp),
            status: 'completed',
            approvalStatus: 'approved', // Historical transactions are auto-approved
            recipientAccountId: data.recipientAccountId,
            reference: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            runningBalance: account.balance,
            metadata: {
              addedByAdmin: session.id,
              historicalEntry: true,
              reason: data.reason,
            },
          },
        });

        // Log the admin action
        await tx.adminActionLog.create({
          data: {
            adminId: session.id,
            action: "add_transaction_history",
            targetType: "transaction",
            targetId: txRecord.id,
            reason: data.reason,
            metadata: {
              transactionType: data.type,
              amount: data.amount,
              accountId: data.accountId,
            },
          },
        });

        return txRecord;
      });

      return NextResponse.json(
        {
          message: "Transaction history entry added successfully",
          transaction,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Add transaction history error:", error);
      
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: "Invalid request data", details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to add transaction history" },
        { status: 500 }
      );
    }
  }
);
