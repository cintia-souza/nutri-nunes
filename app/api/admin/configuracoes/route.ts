import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET — buscar configurações (público para a landing usar)
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = await (prisma as any).configSite.findUnique({ where: { id: 'config' } });
  return NextResponse.json(config || {});
}

// PUT — atualizar configurações (admin only)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const data = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = await (prisma as any).configSite.upsert({
    where: { id: 'config' },
    update: data,
    create: { id: 'config', ...data },
  });

  return NextResponse.json(config);
}
