import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'JWT_SECRET');

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production environment');
}

// -----------------------------
// 1️⃣ Types
// -----------------------------
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface JWTPayload extends JoseJWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

// -----------------------------
// 2️⃣ Token creation
// -----------------------------
export async function signToken(payload: JWTPayload, expMinutes = 20) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${expMinutes}m`)
    .sign(JWT_SECRET);
}

// -----------------------------
// 3️⃣ Token verification
// -----------------------------
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

// -----------------------------
// 4️⃣ Cookie helpers
// -----------------------------
export function setTokenCookie(response: NextResponse, token: string, maxAgeSec = 60 * 20) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });
}

export function removeTokenCookie(response: NextResponse) {
  response.cookies.delete({
    name: 'token',
    path: '/',
  });
}

// -----------------------------
// 5️⃣ Session helpers
// -----------------------------
export async function getSessionFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  return await verifyToken(token);
}

/**
 * Sliding Session Logic: If they are logged in, refresh their token
 * Sliding session: refresh token expiration if user is active
 * @param response NextResponse to update the cookie
 */
export async function refreshSession(response: NextResponse): Promise<JWTPayload | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const newToken = await signToken(session, 20); // 20-min sliding
  setTokenCookie(response, newToken, 60 * 20);

  return session;
}

// -----------------------------
// 6️⃣ Email verification tokens
// -----------------------------
export async function generateVerificationToken(email: string) {
  return await new SignJWT({ email, type: 'verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyVerificationToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const data = payload as { email: string; type?: string };
    if (data.type === 'verification') return data.email;
    return null;
  } catch {
    return null;
  }
}
