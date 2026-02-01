// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/auth';

// 1. Wrap with authorize to handle session check automatically
// 2. We allow any logged-in role ('user', 'admin', etc.)
export const GET = authorize(['user', 'admin', 'superadmin'],
   async (req, { session }) => {
  
  console.log('Incoming cookies:', req.cookies) // NextRequest.cookies
  console.log('Session object:', session)
  // session.userId and session.tenantId must exist
    if (!session.id ) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

  // The wrapper has already verified the session exists!
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      address: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Return flat user object (client expects flat user)
  return NextResponse.json(user);
});