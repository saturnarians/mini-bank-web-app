import { authorize } from '@/lib/auth/guard';
import { accountController } from '@/lib/controllers/accountController';
import { NextResponse } from 'next/server';

export const GET = authorize(['user', 'admin', 'superadmin'], async (req, { session }) => {
  const accounts = await accountController.list(session.id);
  return NextResponse.json(accounts);
});

export const POST = authorize(['user', 'admin', 'superadmin'], async (req, { session }) => {
  const body = await req.json();
  const newAccount = await accountController.create(session.id, body);
  return NextResponse.json(newAccount, { status: 201 });
});