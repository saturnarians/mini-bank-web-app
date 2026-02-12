import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { accountController } from '@/lib/controllers/accountController';


export const dynamic = 'force-dynamic';

export const POST = authorize(['admin', 'superadmin'], 
  async (req: Request, { params , session } ) => {
   try {
      const { id } = params;
      const body = await req.json();

      // We pass: 
      // 1. The account ID from the URL
      // 2. The session (to know which admin is acting)
      // 3. The body (to extract the 'reason')
      const result = await accountController.suspend(id, session, body);

      console.log(`Suspending account with ID: ${id}`);

      return NextResponse.json({
        result, 
        message: `Account ${id} suspended`
      });
    } catch (error: any) {
      console.error(`[API_SUSPEND_ERROR]: ${error.message}`);

      // Map common errors to HTTP statuses
      if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
      if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' }, 
        { status: 500 }
      );
    }
});

// const { data: accounts } = useGetAccountsQuery();