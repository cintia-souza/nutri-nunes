import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, createRefreshToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const payload = { userId: usuario.id, role: usuario.role };
  const token = await createToken(payload);
  const refreshToken = await createRefreshToken(payload);

  const response = NextResponse.json({ role: usuario.role });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 dia
    path: '/',
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  });

  return response;
}
