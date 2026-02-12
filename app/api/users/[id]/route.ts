import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
// import { canManageAdmins } from '@/lib/permission';

export const dynamic = 'force-dynamic';

// GET: Single User
export const GET = authorize(['admin', 'superadmin'], async (req, { params }) => {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { accounts: true }
  });
  
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
});

// PUT: Update User
export const PUT = authorize(['admin', 'superadmin'], async (req, { session, params }) => {
  const body = await req.json();
  
  // Security: Only superadmins can promote others to admin
  if (body.role === 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: body
  });

  return NextResponse.json(updated);
});

// DELETE: Delete User
export const DELETE = authorize(['admin', 'superadmin'], async (req, { session, params }) => {
  if (params.id === session.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});