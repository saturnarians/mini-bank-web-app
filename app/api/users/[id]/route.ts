import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManageUsers, canManageAdmins } from '@/lib/permission';
import { z } from 'zod';

const DEBUG = process.env.NODE_ENV === 'development';

function log(message: string, data?: any) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [API/USERS/[ID]] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [API/USERS/[ID]] ERROR: ${message}`, error ? JSON.stringify(error, null, 2) : '');
}

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['user', 'manager', 'admin', 'superadmin']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    log('GET /api/users/[id] - Incoming request', { userId: id });

    const session = await getSession();
    log('Session retrieved', { sessionUserId: session?.id, role: session?.role });

    if (!session) {
      log('No valid session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.role)) {
      log('User lacks permission to read users', { userRole: session.role });
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    log('Fetching user', { userId: id });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      log('User not found', { userId: id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    log('User found successfully', { userId: user.id, email: user.email, role: user.role });
    return NextResponse.json(user);
  } catch (error) {
    logError('Unexpected error in GET /api/users/[id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    log('PUT /api/users/[id] - Incoming request', { userId: id });

    const session = await getSession();
    log('Session retrieved', { sessionUserId: session?.id, role: session?.role });

    if (!session) {
      log('No valid session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.role)) {
      log('User lacks permission to update users', { userRole: session.role });
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = updateUserSchema.parse(body);

    log('Validating update data', { userId: id, updateData });

    // Check if user trying to change role is allowed
    if (updateData.role && (updateData.role === 'admin' || updateData.role === 'superadmin')) {
      if (!canManageAdmins(session.role)) {
        log('User lacks permission to assign admin/superadmin role', {
          userRole: session.role,
          requestedRole: updateData.role,
        });
        return NextResponse.json(
          { error: 'Forbidden - Cannot assign admin or superadmin role' },
          { status: 403 }
        );
      }
    }

    log('Fetching user to update', { userId: id });

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      log('User not found', { userId: id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      log('Checking if new email is available', { newEmail: updateData.email });

      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        log('Email already in use', { newEmail: updateData.email });
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    log('Updating user', { userId: id, updateData });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    log('User updated successfully', { userId: updatedUser.id, role: updatedUser.role });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError('Validation error in PUT /api/users/[id]', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('Unexpected error in PUT /api/users/[id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    log('DELETE /api/users/[id] - Incoming request', { userId: id });

    const session = await getSession();
    log('Session retrieved', { sessionUserId: session?.id, role: session?.role });

    if (!session) {
      log('No valid session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.role)) {
      log('User lacks permission to delete users', { userRole: session.role });
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Prevent self-deletion
    if (id === session.id) {
      log('User attempting to delete themselves', { userId: id });
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    log('Fetching user to delete', { userId: id });

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      log('User not found', { userId: id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can delete this role
    if (userToDelete.role === 'admin' || userToDelete.role === 'superadmin') {
      if (!canManageAdmins(session.role)) {
        log('User lacks permission to delete admin/superadmin', { userRole: session.role, targetRole: userToDelete.role });
        return NextResponse.json(
          { error: 'Forbidden - Cannot delete admin or superadmin users' },
          { status: 403 }
        );
      }
    }

    log('Deleting user', { userId: id, deletedUserRole: userToDelete.role });

    await prisma.user.delete({
      where: { id },
    });

    log('User deleted successfully', { userId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Unexpected error in DELETE /api/users/[id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
