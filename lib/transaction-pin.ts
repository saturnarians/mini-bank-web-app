import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function assertTransactionPin(args: { userId: string; pin?: string }) {
  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { transactionPinHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.transactionPinHash) {
    throw new Error("TRANSACTION_PIN_NOT_SET");
  }

  if (!args.pin) {
    throw new Error("INVALID_TRANSACTION_PIN");
  }

  const isValidPin = await bcrypt.compare(args.pin, user.transactionPinHash);
  if (!isValidPin) {
    throw new Error("INVALID_TRANSACTION_PIN");
  }
}
