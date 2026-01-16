import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { adminController } from '@/lib/controllers/adminController';

export const PATCH = authorize(['admin'], async (req, { params }) => {
  try {
    const { id } = params; // This is the accountId
    const { amount } = await req.json(); // The new balance to set

    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Pass the admin's ID from the session for the audit log
    const updatedAccount = await adminController.manualBalanceUpdate(
      id, 
      amount, 
      req.session.id
    );

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error('Admin Balance Update Error:', error);
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
  }
});