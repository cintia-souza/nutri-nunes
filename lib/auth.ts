import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  role: Role;
  tenantId: string; // sempre presente — ADMIN e CLIENTE pertencem a um tenant
}

// ─────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// RESOLUÇÃO DO TENANT
//
// Estratégia dupla:
//   1. Usuário autenticado → tenantId vem direto do JWT (zero queries extras)
//   2. Rotas públicas (landing, agendamento, blog) → slug extraído do Host header
//
// Exemplos de Host:
//   maria.nutrinunes.com  → slug = "maria"
//   localhost:3000        → slug = env TENANT_SLUG_DEV (fallback dev)
// ─────────────────────────────────────────────

export async function getTenantFromHost(): Promise<string | null> {
  const headerStore = await headers();
  // Middleware injeta x-tenant-slug (path-based: /adriana/admin → slug = adriana)
  const slug = headerStore.get('x-tenant-slug') ?? '';
  if (!slug) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = await (prisma as any).tenant.findUnique({
    where: { slug },
    select: { id: true, ativo: true },
  });

  return tenant?.ativo ? tenant.id : null;
}

// Helper unificado: prefere o JWT (autenticado), cai no Host (público)
export async function resolveTenantId(): Promise<string | null> {
  const session = await getSession();
  if (session?.tenantId) return session.tenantId;
  return getTenantFromHost();
}
