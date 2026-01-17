import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { ZodError } from 'zod';

type ProtectedHandler = (
  req: NextRequest, 
  context: { params: any; session: any }
) => Promise<NextResponse>;

export function authorize(roles: string[], handler: ProtectedHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      const session = await getSessionFromCookies();

      // 1. Auth Check
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Permission Check
      if (!roles.includes(session.role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      // 3. Execute Handler
      return await handler(req, { ...context, session });

    } catch (error: any) {
      // 4. Global Error Handling (Zod + Server Errors)
      if (error instanceof ZodError) {
        return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
      }
      console.error("API Error:", error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}