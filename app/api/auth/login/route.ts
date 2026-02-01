// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/lib/controllers/authController';
import { ZodError } from 'zod';
import { setTokenCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';


export async function POST(request: NextRequest) {
  try {

const body = loginSchema.parse(await request.json());
const { user, token , expiresIn } = await authController.login(body);

 // Validate user
if (!user) {
  return NextResponse.json(
    { error: 'Invalid email or password' },
    { status: 401 }
  ); 
}
  
// Create A response
const response = NextResponse.json( user , {status: 200});

setTokenCookie(response, token, expiresIn );

    return response;
  } catch (error: any) {
    // Specific error handling
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    if (error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.error("Login Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
