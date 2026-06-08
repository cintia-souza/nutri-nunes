import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token ausente' }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);
  if (!payload) {
    const response = NextResponse.json({ error: 'Refresh token inválido' }, { status: 401 });
    response.cookies.set('token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return response;
  }

  const newToken = await createToken(payload);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 dia
    path: '/',
  });

  return response;
}
