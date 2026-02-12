import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { accountController } from '@/lib/controllers/accountController';

export const dynamic = 'force-dynamic';

// GET: Single account details
export const GET = authorize(['user', 'admin', 'superadmin'], async (req, { params, session }) => {
  const account = await accountController.list(session.id); // Or specific getById logic
  return NextResponse.json(account);
});


// PATCH: Update account
export const PATCH = authorize(['user', 'admin', 'superadmin'], async (req, { params, session }) => { 
  const body = await req.json();
  const updated = await accountController.update(params.id, session, body);
  return NextResponse.json(updated);
});

// DELETE: Remove account
export const DELETE = authorize(['user', 'admin', 'superadmin'], async (req, { params, session }) => {
  const result = await accountController.delete(params.id, session);
  return NextResponse.json({ message: 'Account deleted successfully', id: result });
});