import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { adjustBalanceController } from "@/lib/controllers/adjustAccountBalanceController";

// 1. We type the Context specifically based on your error
type Context = {
  params: any;
  session: {
    id: string;
    email: string;
    // Add other session properties if needed
  };
};

export const POST = authorize(["admin", "superadmin"], 
  // 2. The second argument is 'context', not 'admin' directly
  async (req: NextRequest, context: Context) => {
    try {
      // 3. Extract the session from the context
      const { session } = context;

      return await adjustBalanceController(req, {
          // 4. Map the session properties to what the controller expects
          id: session.id,
          email: session.email,
        }
      );
    } catch (err) {
      return NextResponse.json(
        { message: err instanceof Error ? err.message : "Server error" },
        { status: 403 }
      );
    }
  }
);