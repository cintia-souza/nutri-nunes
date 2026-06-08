import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planos = await (prisma as any).plano.findMany({ orderBy: { ordem: 'asc' } });
    return NextResponse.json(planos);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const data = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plano = await (prisma as any).plano.create({ data });
  return NextResponse.json(plano, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id, ...data } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plano = await (prisma as any).plano.update({ where: { id }, data });
  return NextResponse.json(plano);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).plano.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
