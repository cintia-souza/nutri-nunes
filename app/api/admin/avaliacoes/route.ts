import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avaliacoes = await (prisma as any).avaliacao.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { cliente: { select: { nome: true, email: true } } },
    });
    return NextResponse.json(avaliacoes);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id, aprovada } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avaliacao = await (prisma as any).avaliacao.update({ where: { id }, data: { aprovada } });
  return NextResponse.json(avaliacao);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { id } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).avaliacao.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
