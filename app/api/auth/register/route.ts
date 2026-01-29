import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { setTokenCookie } from '@/lib/auth'; // Ensure this path is correct
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw JSON
    const body = await req.json();

    // 2. Pass raw body to Controller
    // The controller validates it using registerSchema internally
    const { user, token, expiresIn } = await authController.register(body);

    // 3. Create Response
    const response = NextResponse.json({ user }, { status: 201 });
    
    // 4. Set HTTP-Only Cookie
    // Note: setTokenCookie usually modifies the 'headers' of the response object passed to it
    setTokenCookie(response, token, expiresIn);

    return response;

  } catch (err: any) {
    // Handle Validation Errors (Bubbled up from Controller)
    if (err instanceof ZodError) {
      // Return the first error message for simplicity, or the whole array
      return NextResponse.json(
        { error: err.errors[0].message }, 
        { status: 400 }
      );
    }

    // Handle Business Logic Errors
    if (err.message === 'USER_EXISTS') {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 } // 409 is better for conflicts
      );
    }

    console.error("Registration Route Error:", err);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}