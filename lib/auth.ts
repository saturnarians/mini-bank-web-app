import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'JWT_SECRET');

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment");
}

export async function signToken(payload: { id: string; email: string; role: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('20m')
    .sign(JWT_SECRET);

  return token;
}

export async function generateVerificationToken(email: string) {
  const token = await new SignJWT({ email, type: 'verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyVerificationToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as { email: string; type: string };
    if (payload.type === 'verification') {
      return payload.email;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  return await verifyToken(token);
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 20, // 20 minutes
  });
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
