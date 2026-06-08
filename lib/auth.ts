import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { Role } from '@/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export interface SessionPayload {
  userId: string;
  role: Role;
}

export async function createToken(payload: SessionPayload, expiresIn = '1d'): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function createRefreshToken(payload: SessionPayload): Promise<string> {
  return createToken(payload, '30d');
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
