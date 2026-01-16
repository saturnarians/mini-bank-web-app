import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// 1. Secret setup
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'JWT_SECRET');

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error("JWT_SECRET must be set in production environment");
}

/**
 * 2. Token Creation
 * ROLE LOCATION: The role is passed in here and encoded into the JWT payload.
 */
export async function signToken(payload: { id: string; email: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('20m') // The "20-minute clock" starts here
    .sign(JWT_SECRET);
}

/**
 * 3. Token Verification
 * ROLE LOCATION: The role is extracted from the decrypted payload here.
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * 4. Session Management
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  return await verifyToken(token); 
}

/**
 * 5. Sliding Session Logic
 * This refreshes the "20-minute clock" without requiring the user to log in again.
 */
export async function updateSession() {
  const session = await getSession();
  if (!session) return null;

  // Sign a NEW token using the SAME user data (Role stays the same)
  const newToken = await signToken({
    id: session.id,
    email: session.email,
    role: session.role,
  });
  
  // Update the cookie with the new token and a fresh expiration
  await setTokenCookie(newToken);
  
  return session;
}

/**
 * 6. Cookie Helpers
 */
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 20, // 20 minutes in seconds
  });
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

/**
 * 7. Email Verification (Separate from login sessions)
 */
export async function generateVerificationToken(email: string) {
  return await new SignJWT({ email, type: 'verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyVerificationToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const data = payload as { email: string; type: string };
    if (data.type === 'verification') return data.email;
    return null;
  } catch (error) {
    return null;
  }
}