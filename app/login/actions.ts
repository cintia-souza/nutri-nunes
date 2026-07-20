'use server';

import { prisma } from '@/lib/prisma';
import { createToken, createRefreshToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const senha = formData.get('senha') as string;

  if (!email || !senha) return { error: 'Email e senha são obrigatórios' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email inválido' };

  const cookieStore = await cookies();
  // Slug setado pelo middleware via cookie (headers customizados não chegam em Server Actions)
  const slug = cookieStore.get('tenant-slug')?.value ?? '';

  console.log('[login] email:', email, '| slug:', slug);

  let usuario;
  const superAdmin = await prisma.usuario.findFirst({ where: { email, role: 'SUPERADMIN' } });
  console.log('[login] superAdmin encontrado:', !!superAdmin);

  if (superAdmin) {
    usuario = superAdmin;
  } else {
    let tenantId: string | null = null;
    if (slug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenant = await (prisma as any).tenant.findUnique({ where: { slug }, select: { id: true, ativo: true } });
      console.log('[login] tenant pelo slug:', tenant);
      tenantId = tenant?.ativo ? tenant.id : null;
    }
    console.log('[login] tenantId resolvido:', tenantId);
    if (!tenantId) {
      await bcrypt.compare(senha, '$2a$10$invalidhashtopreventtimingattack');
      return { error: 'Credenciais inválidas' };
    }
    usuario = await prisma.usuario.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
    console.log('[login] usuario encontrado:', !!usuario, usuario?.role);
  }

  const senhaValida = usuario
    ? await bcrypt.compare(senha, usuario.senhaHash)
    : await bcrypt.compare(senha, '$2a$10$invalidhashtopreventtimingattack');
  console.log('[login] senhaValida:', senhaValida);

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

  cookieStore.set('token', token, { ...cookieBase, maxAge: 60 * 60 * 24 });
  cookieStore.set('refreshToken', refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

  const prefix = slug ? `/${slug}` : '';
  const dest =
    usuario.role === 'SUPERADMIN' ? '/super-admin' :
    usuario.role === 'ADMIN' ? `${prefix}/admin` :
    `${prefix}/cliente`;

  redirect(dest);
}
