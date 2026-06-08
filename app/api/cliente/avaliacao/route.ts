import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });
  const { nota, texto } = await req.json();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avaliacao = await (prisma as any).avaliacao.create({
      data: { clienteId: session.userId, nota, texto },
    });
    return NextResponse.json(avaliacao, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function GET() {
  // Público: retorna avaliações aprovadas para a landing
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avaliacoes = await (prisma as any).avaliacao.findMany({
      where: { aprovada: true },
      orderBy: { criadoEm: 'desc' },
      take: 10,
      include: { cliente: { select: { nome: true } } },
    });
    return NextResponse.json(avaliacoes);
  } catch {
    return NextResponse.json([]);
  }
}
