import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Slugs reservados que nunca são tenants
const RESERVED = new Set(['api', 'login', 'admin', 'cliente', 'super-admin', 'blog', 'formulario', '_next', 'favicon.ico', 'logo.png', 'icons', 'sw.js']);

async function resolveTenantSlug(req: NextRequest): Promise<string> {
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV === 'development') {
    return process.env.TENANT_SLUG_DEV || '';
  }

  // Path-based: /<slug>/... ou /<slug>
  const firstSegment = pathname.split('/')[1] ?? '';
  if (firstSegment && !RESERVED.has(firstSegment)) {
    return firstSegment;
  }

  return '';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas que não precisam de tenant
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/ping') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/api/super-admin') ||
    pathname === '/favicon.ico'
  ) {
    return handleSuperAdminAndPassthrough(req, pathname);
  }

  const slug = await resolveTenantSlug(req);

  // Em produção, valida se o slug existe e está ativo
  if (process.env.NODE_ENV !== 'development' && slug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenant = await (prisma as any).tenant.findUnique({
      where: { slug },
      select: { id: true, ativo: true },
    });

    if (!tenant || !tenant.ativo) {
      return new NextResponse(null, { status: 404 });
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-tenant-slug', slug);

  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  let session = token ? await verifyToken(token) : null;
  if (!session && refreshToken) session = await verifyToken(refreshToken);

  // Rotas protegidas (após rewrite, chegam sem o slug no path)
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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

async function handleSuperAdminAndPassthrough(req: NextRequest, pathname: string) {
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/api/super-admin')) {
    const token = req.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session || session.role !== 'SUPERADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|icons|sw.js).*)',
  ],
};
