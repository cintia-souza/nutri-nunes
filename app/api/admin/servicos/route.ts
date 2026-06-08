import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicos = await (prisma as any).servico.findMany({ orderBy: { ordem: 'asc' } });
    return NextResponse.json(servicos);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const data = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const servico = await (prisma as any).servico.create({ data });
  return NextResponse.json(servico, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id, ...data } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const servico = await (prisma as any).servico.update({ where: { id }, data });
  return NextResponse.json(servico);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).servico.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
