'use server';

import { prisma } from '@/lib/prisma';
import { createToken, createRefreshToken, resolveTenantId } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const senha = formData.get('senha') as string;

  if (!email || !senha) return { error: 'Email e senha são obrigatórios' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email inválido' };

  let usuario;
  const superAdmin = await prisma.usuario.findFirst({ where: { email, role: 'SUPERADMIN' } });

  if (superAdmin) {
    usuario = superAdmin;
  } else {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      await bcrypt.compare(senha, '$2a$10$invalidhashtopreventtimingattack');
      return { error: 'Credenciais inválidas' };
    }
    usuario = await prisma.usuario.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
  }

  const senhaValida = usuario
    ? await bcrypt.compare(senha, usuario.senhaHash)
    : await bcrypt.compare(senha, '$2a$10$invalidhashtopreventtimingattack');

  if (!usuario || !senhaValida) return { error: 'Credenciais inválidas' };

  const payload = { userId: usuario.id, role: usuario.role, tenantId: usuario.tenantId };
  const [token, refreshToken] = await Promise.all([
    createToken(payload),
    createRefreshToken(payload),
  ]);

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  const cookieStore = await cookies();
  cookieStore.set('token', token, { ...cookieBase, maxAge: 60 * 60 * 24 });
  cookieStore.set('refreshToken', refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

  const headerStore = await headers();
  const slug = headerStore.get('x-tenant-slug') ?? '';
  const prefix = slug ? `/${slug}` : '';

  const dest =
    usuario.role === 'SUPERADMIN' ? '/super-admin' :
    usuario.role === 'ADMIN' ? `${prefix}/admin` :
    `${prefix}/cliente`;

  redirect(dest);
}
