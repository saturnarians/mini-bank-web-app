import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { approveTransactionSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

export const POST = authorize(
  ["admin", "superadmin"],
  async (req, { session }) => {
    try {
      const body = await req.json();
      const { transactionId, reason } = approveTransactionSchema.parse(body);

      // Find the transaction
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Check if already processed
      if (transaction.approvalStatus !== "pending") {
        return NextResponse.json(
          { error: `Transaction already ${transaction.approvalStatus}` },
          { status: 400 }
        );
      }

      // Update transaction approval status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          approvalStatus: "approved",
          approvedBy: session.id,
          approvedAt: new Date(),
        },
      });

      // Log the approval action
      await prisma.adminActionLog.create({
        data: {
          adminId: session.id,
          action: "approve_transaction",
          targetType: "transaction",
          targetId: transactionId,
          reason: reason || "Transaction approved",
          metadata: {
            transactionAmount: transaction.amount,
            transactionType: transaction.type,
            accountId: transaction.accountId,
          },
        },
      });

      return NextResponse.json(
        {
          message: "Transaction approved successfully",
          transaction: updatedTransaction,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Approve transaction error:", error);
      return NextResponse.json(
        { error: "Failed to approve transaction" },
        { status: 500 }
      );
    }
  }
);
