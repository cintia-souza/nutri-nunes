import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Slugs reservados que nunca são tenants
const RESERVED = new Set([
  'api', 'login', 'admin', 'cliente', 'super-admin',
  'blog', 'formulario', '_next', 'favicon.ico', 'logo.png', 'icons', 'sw.js',
]);

function extractSlug(req: NextRequest): string {
  if (process.env.NODE_ENV === 'development') {
    return process.env.TENANT_SLUG_DEV || '';
  }
  const firstSegment = req.nextUrl.pathname.split('/')[1] ?? '';
  return firstSegment && !RESERVED.has(firstSegment) ? firstSegment : '';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  let session = token ? await verifyToken(token) : null;
  if (!session && refreshToken) session = await verifyToken(refreshToken);

  // Super admin — sem slug
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/api/super-admin')) {
    if (!session || session.role !== 'SUPERADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  const slug = extractSlug(req);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', slug);

  // Rotas protegidas (chegam sem slug após rewrite)
  if (pathname.startsWith('/cliente') || pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = slug ? `/${slug}/login` : '/login';
      const res = NextResponse.redirect(new URL(loginUrl, req.url));
      res.cookies.set('token', '', { maxAge: 0, path: '/' });
      res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
      return res;
    }
    if (pathname.startsWith('/admin') && session.role !== 'ADMIN' && session.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL(slug ? `/${slug}/cliente` : '/cliente', req.url));
    }
    if (pathname.startsWith('/cliente') && session.role !== 'CLIENTE') {
      return NextResponse.redirect(new URL(slug ? `/${slug}/admin` : '/admin', req.url));
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }
  }

  if (pathname.startsWith('/api/cliente')) {
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Cookie leve (não httpOnly) para Server Actions lerem via cookies()
  if (slug) res.cookies.set('tenant-slug', slug, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|icons|sw.js).*)'],
};
