import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { transactionService } from "@/lib/services/transactionService";
import { externalTransferSchema } from "@/lib/schemas";
import { assertTransactionPin } from "@/lib/transaction-pin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = externalTransferSchema.parse(await req.json());
    const {
      accountId,
      amount,
      recipientBank,
      recipientAccountNumber,
      recipientName,
      swiftCode,
      iban,
      routingNumber,
      description,
      pin,
    } = body;

    assertTransactionPin(pin);

    const transfer = await transactionService.createExternalTransfer({
      userId: session.id,
      accountId,
      amount,
      recipientBank,
      recipientAccountNumber: String(recipientAccountNumber),
      recipientName,
      swiftCode,
      iban,
      routingNumber: routingNumber ? String(routingNumber) : undefined,
      description,
    });

    return NextResponse.json({ success: true, transfer });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: error.errors?.[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    switch (error?.message) {
      case "ACCOUNT_NOT_FOUND":
        return NextResponse.json(
          { error: error.message, message: "Account not found." },
          { status: 404 }
        );
      case "ACCOUNT_SUSPENDED":
        return NextResponse.json(
          { error: error.message, message: "Account is suspended and cannot make transactions." },
          { status: 403 }
        );
      case "INSUFFICIENT_FUNDS":
        return NextResponse.json(
          { error: error.message, message: "Insufficient funds." },
          { status: 422 }
        );
      case "INVALID_TRANSACTION_PIN":
        return NextResponse.json(
          { error: error.message, message: "Invalid transaction PIN." },
          { status: 403 }
        );
      default:
        console.error("Transfer Error:", error);
        return NextResponse.json(
          { error: error?.message || "Transfer failed" },
          { status: 500 }
        );
    }
  }
}
