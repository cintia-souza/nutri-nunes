import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Proteger páginas autenticadas
  if (pathname.startsWith('/cliente') || pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const session = await verifyToken(token);
    if (!session) {
      // Token inválido — tentar refresh
      const refreshToken = req.cookies.get('refreshToken')?.value;
      if (!refreshToken) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      const refreshSession = await verifyToken(refreshToken);
      if (!refreshSession) {
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.set('token', '', { maxAge: 0, path: '/' });
        res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
        return res;
      }
    }

    const role = (await verifyToken(token))?.role || (await verifyToken(req.cookies.get('refreshToken')?.value || ''))?.role;

    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/cliente', req.url));
    }
    if (pathname.startsWith('/cliente') && role !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Proteger APIs admin
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
  }

  // Proteger APIs do cliente
  if (pathname.startsWith('/api/cliente')) {
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cliente/:path*', '/admin/:path*', '/api/admin/:path*', '/api/cliente/:path*'],
};
