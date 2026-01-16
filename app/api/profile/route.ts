import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/guard';
import { profileController } from '@/lib/controllers/profileController';

// GET: Fetch current user profile
export const GET = authorize(['user', 'admin'], async (req, { session }) => {
  try {
    const profile = await profileController.get(session.id);
    return NextResponse.json(profile);
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    throw error; // Let the authorize wrapper catch unexpected errors
  }
});

export const POST = authorize(['user', 'admin'], async (req, { session }) => {
  try {
    const body = await req.json();
    await profileController.changePassword(session.id, body);
    
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.message === "INVALID_CURRENT_PASSWORD") {
      return NextResponse.json({ error: 'The current password you entered is incorrect' }, { status: 400 });
    }
    throw error; // Zod errors are handled by authorize guard
  }
});

// PUT: Update current user profile
export const PUT = authorize(['user', 'admin'], async (req, { session }) => {
  const body = await req.json();
  const updatedProfile = await profileController.update(session.id, body);
  return NextResponse.json(updatedProfile);
});