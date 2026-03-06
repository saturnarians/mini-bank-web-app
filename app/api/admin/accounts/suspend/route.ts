import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { adminAccountController } from "@/lib/controllers/adminAccountController";
import { ZodError } from "zod";

export const dynamic = 'force-dynamic';

type Context = {
  params: any;
  session: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
};

export const POST = authorize(["admin", "superadmin"], async (req: NextRequest, context: Context) => {
  try {
    const { session } = context;
    console.log("[API][admin/accounts/suspend] request received", {
      adminId: session.id,
      adminEmail: session.email,
    });

    let previewAccountId: string | undefined;
    try {
      const cloned = req.clone();
      const body = await cloned.json();
      previewAccountId = body?.accountId;
      console.log("[API][admin/accounts/suspend] payload preview", {
        accountId: previewAccountId,
      });
    } catch {
      console.log("[API][admin/accounts/suspend] payload preview unavailable");
    }

    return await adminAccountController.suspendAccount(req, {
      id: session.id,
      email: session.email,
      name: session.name,
    });
  } catch (err) {
    console.error("[API][admin/accounts/suspend] failed", err);
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const msg = err instanceof Error ? err.message : String(err);

    if (msg === "ACCOUNT_NOT_FOUND") {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    console.error("Suspend account error:", err);
    return NextResponse.json(
      { error: msg || "Server error" },
      { status: 500 }
    );
  }
});
