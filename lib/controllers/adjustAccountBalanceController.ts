import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transactionService";
import { adminAdjustBalanceSchema } from "@/lib/schemas";

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
    const body = await req.json();
    const { accountId, amount, reason } = adminAdjustBalanceSchema.parse(body);

    // Extract client IP safely: prefer first value from x-forwarded-for,
    // fall back to x-real-ip, otherwise 'unknown'.
    const xff = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");
    const ipAddress = xff ? xff.split(",")[0].trim() : (xRealIp || "unknown");

    const tx = await transactionService.adminAdjustBalance({
      accountId,
      amount,
      reason,
      admin,
      ipAddress,
    });

    return NextResponse.json(tx);
  } catch (error) {
    // Ideally, throw here to let the route handler catch it, 
    // or handle specific controller logic errors here.
    throw error; 
  }
}