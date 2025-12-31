import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManageUsers, canManageAdmins } from '@/lib/permission';
import { z } from 'zod';

const DEBUG = process.env.NODE_ENV === 'development';

function log(message: string, data?: any) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [API/USERS] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [API/USERS] ERROR: ${message}`, error ? JSON.stringify(error, null, 2) : '');
}

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['user', 'manager', 'admin', 'superadmin']).default('user'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    log('GET /api/users - Incoming request');

    const session = await getSession();
    log('Session retrieved', { userId: session?.id, role: session?.role });

    if (!session) {
      log('No valid session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.role)) {
      log('User lacks permission to manage users', { userRole: session.role });
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    log('Fetching all users');
    const users = await prisma.user.findMany({
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

    log('Users fetched successfully', { count: users.length });
    return NextResponse.json(users);
  } catch (error) {
    logError('Unexpected error in GET /api/users', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    log('POST /api/users - Incoming request');

    const session = await getSession();
    log('Session retrieved', { userId: session?.id, role: session?.role });

    if (!session) {
      log('No valid session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageUsers(session.role)) {
      log('User lacks permission to create users', { userRole: session.role });
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password, role, phone, address } = createUserSchema.parse(body);

    // Check if requesting user can assign this role
    if (role === 'admin' || role === 'superadmin') {
      if (!canManageAdmins(session.role)) {
        log('User lacks permission to create admin/superadmin', { userRole: session.role, requestedRole: role });
        return NextResponse.json(
          { error: 'Forbidden - Cannot assign admin or superadmin role' },
          { status: 403 }
        );
      }
    }

    log('Checking if email already exists', { email });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      log('Email already exists', { email });
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    log('Creating new user', { email, name, role });

    const bcryptjs = await import('bcryptjs');
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phone,
        address,
      },
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

    log('User created successfully', { userId: user.id, email: user.email, role: user.role });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError('Validation error in POST /api/users', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('Unexpected error in POST /api/users', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
