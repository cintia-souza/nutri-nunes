import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // Resolve session uma única vez
  let session = token ? await verifyToken(token) : null;

  // Se token expirado, tenta refresh
  if (!session && refreshToken) {
    session = await verifyToken(refreshToken);
  }

  // Proteger páginas
  if (pathname.startsWith('/cliente') || pathname.startsWith('/admin')) {
    if (!session) {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.set('token', '', { maxAge: 0, path: '/' });
      res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
      return res;
    }
    if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/cliente', req.url));
    }
    if (pathname.startsWith('/cliente') && session.role !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Proteger APIs admin
  if (pathname.startsWith('/api/admin')) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }
  }

  // Proteger APIs do cliente
  if (pathname.startsWith('/api/cliente')) {
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cliente/:path*', '/admin/:path*', '/api/admin/:path*', '/api/cliente/:path*'],
};
