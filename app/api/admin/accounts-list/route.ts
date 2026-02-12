import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { accountService } from '@/lib/services/accountService';

/**
 * Admin-only endpoint to list ALL accounts with user information
 * GET /api/admin/accounts-list
 * 
 * Returns accounts with user relationship data (name, email)
 * Used by admin dashboard to display all accounts
 */
export const dynamic = 'force-dynamic';

export const GET = authorize(['admin', 'superadmin'], async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const status = searchParams.get('status') || undefined;
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');

    // Call admin-specific service method that includes user data
    const accounts = await accountService.listAll({
      status: status as any,
      skip,
      take,
    });

    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error('[ADMIN_ACCOUNTS_LIST_ERROR]:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
});
