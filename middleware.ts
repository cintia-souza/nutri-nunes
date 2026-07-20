import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  let slug = '';

  if (process.env.NODE_ENV === 'development') {
    slug = process.env.TENANT_SLUG_DEV || '';
  } else {
    slug = hostname.split('.')[0];

    if (slug === 'localhost' || slug === 'www' || hostname.includes('vercel.dev')) {
      slug = '';
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', slug);

  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  let session = token ? await verifyToken(token) : null;

  if (!session && refreshToken) {
    session = await verifyToken(refreshToken);
  }

  if (pathname.startsWith('/cliente') || pathname.startsWith('/admin')) {
    if (!session) {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.set('token', '', { maxAge: 0, path: '/' });
      res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
      return res;
    }
    if (pathname.startsWith('/admin') && session.role !== 'ADMIN' && session.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/cliente', req.url));
    }
    if (pathname.startsWith('/cliente') && session.role !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Proteger área e API super-admin
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/api/super-admin')) {
    if (!session || session.role !== 'SUPERADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Proteger APIs admin
  if (pathname.startsWith('/api/admin')) {
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }
  }

  // Proteger APIs do cliente
  if (pathname.startsWith('/api/cliente')) {
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
  }

  // Retorna a requisição aplicando os novos headers que carregam o slug do inquilino
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Atualizamos o matcher para incluir a rota raiz '/' e monitorar o tenant globalmente
export const config = {
  matcher: [
    '/',
    '/super-admin',
    '/super-admin/:path*',
    '/cliente/:path*',
    '/admin/:path*',
    '/api/super-admin/:path*',
    '/api/admin/:path*',
    '/api/cliente/:path*'
  ],
};