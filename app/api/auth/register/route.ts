import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { registerSchema } from '@/lib/schemas'; // Assume you have a registration schema
import { signToken, setTokenCookie, UserRole } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Input
    const body = registerSchema.parse(await req.json());

    // 2. Register User
    // Assuming register returns { user: { id, email, name, role ... } }
    const { user, token, expiresIn }  = await authController.register(body);

    // 3. Call Session (Optional but recommended for UX)
    const response = NextResponse.json({ user }, { status: 201 });
    
    // 4. Set Cookie
    setTokenCookie( response, token, expiresIn );

    return response;

  } catch (err: any) {
    // Handle Validation Errors
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }

    // Handle Logic Errors
    if (err.message === 'USER_EXISTS') {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    console.error("Registration Error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}