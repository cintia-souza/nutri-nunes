import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const data = req.nextUrl.searchParams.get('data') || new Date().toISOString().split('T')[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json([], { status: 400 });
  }

  const checks = await prisma.checkRefeicao.findMany({
    where: { clienteId: session.userId, data },
  });

  return NextResponse.json(checks);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { refeicaoId, realizada, data } = await req.json();

    if (!refeicaoId || typeof refeicaoId !== 'string' || !data || typeof realizada !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }

    // Verifica que a refeição pertence a uma dieta ativa do paciente (previne IDOR)
    const refeicao = await prisma.refeicao.findFirst({
      where: { id: refeicaoId, dieta: { clienteId: session.userId, ativa: true } },
      select: { id: true },
    });

    if (!refeicao) {
      return NextResponse.json({ error: 'Refeição não encontrada' }, { status: 404 });
    }

    const check = await prisma.checkRefeicao.upsert({
      where: { clienteId_refeicaoId_data: { clienteId: session.userId, refeicaoId, data } },
      update: { realizada },
      create: { clienteId: session.userId, refeicaoId, data, realizada },
    });

    return NextResponse.json(check);
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
