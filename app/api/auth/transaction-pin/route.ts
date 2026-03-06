import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth/guard";
import { setTransactionPinSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export const POST = authorize(["user", "admin", "superadmin"], async (req: NextRequest, { session }) => {
  try {
    const body = setTransactionPinSchema.parse(await req.json());
    const currentPin = body.currentPin || undefined;
    const newPin = body.newPin;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        transactionPinHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "User not found." }, { status: 404 });
    }

    if (user.transactionPinHash) {
      if (!currentPin) {
        return NextResponse.json(
          { error: "CURRENT_PIN_REQUIRED", message: "Current transaction PIN is required." },
          { status: 400 }
        );
      }

      const currentPinMatches = await bcrypt.compare(currentPin, user.transactionPinHash);
      if (!currentPinMatches) {
        return NextResponse.json(
          { error: "INVALID_CURRENT_TRANSACTION_PIN", message: "Current transaction PIN is invalid." },
          { status: 403 }
        );
      }
    }

    const newPinHash = await bcrypt.hash(newPin, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        transactionPinHash: newPinHash,
        transactionPinSetAt: new Date(),
      },
    });

    return NextResponse.json({
      message: user.transactionPinHash
        ? "Transaction PIN updated successfully."
        : "Transaction PIN created successfully.",
      hasTransactionPin: true,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "INVALID_INPUT", message: error.errors?.[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    console.error("Set transaction PIN error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Internal server error." },
      { status: 500 }
    );
  }
});

