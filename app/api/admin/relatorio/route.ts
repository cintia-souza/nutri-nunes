import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const [cliente, checks, progressos, feedbacks] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: clienteId },
      select: { id: true, nome: true, email: true, pesoAtual: true, altura: true, objetivo: true },
    }),
    prisma.checkRefeicao.findMany({
      where: { clienteId },
      orderBy: { data: 'desc' },
      take: 90,
    }),
    prisma.registroProgresso.findMany({
      where: { clienteId },
      orderBy: { data: 'desc' },
      take: 30,
    }),
    prisma.feedback.findMany({
      where: { clienteId },
      orderBy: { criadoEm: 'desc' },
      take: 20,
    }),
  ]);

  return NextResponse.json({ cliente, checks, progressos, feedbacks });
}
