import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
// import { canManageAdmins } from '@/lib/permission';

export const dynamic = 'force-dynamic';

async function getRouteId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = await params;
  return resolved.id;
}

// GET: Single User
export const GET = authorize(['admin', 'superadmin'], async (req, { params }) => {
  const id = await getRouteId(params);
  const user = await prisma.user.findUnique({
    where: { id },
    include: { accounts: true }
  });
  
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
});

// PUT: Update User
export const PUT = authorize(['admin', 'superadmin'], async (req, { session, params }) => {
  const id = await getRouteId(params);
  const body = await req.json();
  
  // Security: Only superadmins can promote others to admin
  if (body.role === 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: body,
  });

  const normalizedStatus = (body?.status ?? "").toString().trim().toLowerCase();

  // Keep account-level status consistent when admin suspends/resumes a user.
  // Done as sequential writes to avoid Mongo transient transaction failures.
  if (normalizedStatus === "suspended") {
    await prisma.account.updateMany({
      where: { userId: id },
      data: { status: "suspended" },
    });
  } else if (normalizedStatus === "active") {
    await prisma.account.updateMany({
      where: { userId: id, status: "suspended" },
      data: { status: "active" },
    });
  }

  return NextResponse.json(updated);
});

// DELETE: Delete User
export const DELETE = authorize(['admin', 'superadmin'], async (req, { session, params }) => {
  const id = await getRouteId(params);

  if (id === session.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
