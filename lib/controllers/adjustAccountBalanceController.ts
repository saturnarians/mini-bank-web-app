import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transactionService";

// Define the interface for the admin object for type safety
interface AdminContext {
  id: string;
  email: string;
}

export async function adjustBalanceController(
  req: NextRequest,
  admin: AdminContext
) {
  try {
    const { accountId, amount, reason } = await req.json();

    // Basic validation (Optional but recommended)
    if (!accountId || !amount) {
      return NextResponse.json(
        { message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const tx = await transactionService.adminAdjustBalance({
      accountId,
      amount,
      reason,
      admin, 
      // specific headers can be null, fallback is good
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json(tx);
  } catch (error) {
    // Ideally, throw here to let the route handler catch it, 
    // or handle specific controller logic errors here.
    throw error; 
  }
}