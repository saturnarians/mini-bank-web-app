import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

const DEBUG = process.env.NODE_ENV === 'development';

function log(message: string, data?: any) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AUTH/ME] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [AUTH/ME] ERROR: ${message}`, error ? JSON.stringify(error, null, 2) : '');
}

export async function GET(request: NextRequest) {
  try {
    log('GET /api/auth/me - Incoming request');

    // Get session from JWT token
    const session = await getSession();
    log('Session retrieved', { userId: session?.id, email: session?.email });

    if (!session) {
      log('No valid session found - returning 401');
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    // Fetch user details from database
    log('Fetching user details from database', { userId: session.id });
    const user = await prisma.user.findUnique({
      where: { id: session.id },
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
      log('User not found in database', { userId: session.id });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    log('User found successfully', { userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user,
    });
  } catch (error) {
    logError('Unexpected error occurred', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
