import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { adminAccountController } from "@/lib/controllers/adminAccountController";
import { ZodError } from "zod";

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
    return await adminAccountController.resumeAccount(req, {
      id: session.id,
      email: session.email,
      name: session.name,
    });
  } catch (err) {
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

    console.error("Resume account error:", err);
    return NextResponse.json(
      { error: msg || "Server error" },
      { status: 500 }
    );
  }
});
