import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, createRefreshToken, resolveTenantId } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha || typeof email !== 'string' || typeof senha !== 'string') {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // findUnique não funciona mais (email não é globalmente único)
    // Precisa do tenantId para resolver o usuário correto
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { tenantId_email: { tenantId, email: emailNorm } } });
    // Sempre executa bcrypt para evitar timing attack
    const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : await bcrypt.compare(senha, '$2a$10$invalidhashtopreventtimingattack');

    if (!usuario || !senhaValida) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const payload = { userId: usuario.id, role: usuario.role, tenantId };
    const [token, refreshToken] = await Promise.all([
      createToken(payload),
      createRefreshToken(payload),
    ]);

    const response = NextResponse.json({ role: usuario.role });

    const cookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('token', token, { ...cookieBase, maxAge: 60 * 60 * 24 });
    response.cookies.set('refreshToken', refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });

    return response;
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
