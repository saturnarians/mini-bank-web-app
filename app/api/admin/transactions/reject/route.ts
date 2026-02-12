import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { rejectTransactionSchema } from "@/lib/schemas";

export const POST = authorize(
  ["admin", "superadmin"],
  async (req, { session }) => {
    try {
      const body = await req.json();
      const { transactionId, rejectionReason } = rejectTransactionSchema.parse(body);

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

      // Update transaction rejection status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          approvalStatus: "rejected",
          approvedBy: session.id,
          approvedAt: new Date(),
          rejectionReason: rejectionReason,
        },
      });

      // Log the rejection action
      await prisma.adminActionLog.create({
        data: {
          adminId: session.id,
          action: "reject_transaction",
          targetType: "transaction",
          targetId: transactionId,
          reason: rejectionReason,
          metadata: {
            transactionAmount: transaction.amount,
            transactionType: transaction.type,
            accountId: transaction.accountId,
          },
        },
      });

      return NextResponse.json(
        {
          message: "Transaction rejected successfully",
          transaction: updatedTransaction,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Reject transaction error:", error);
      return NextResponse.json(
        { error: "Failed to reject transaction" },
        { status: 500 }
      );
    }
  }
);
