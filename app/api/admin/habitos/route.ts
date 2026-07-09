import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const habitos = await prisma.registroHabito.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' },
    take: 60,
  });

  return NextResponse.json(habitos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const body = await req.json();
  const { clienteId, data, aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao } = body;

  if (!clienteId || !data) return NextResponse.json({ error: 'clienteId e data obrigatórios' }, { status: 400 });

  const habito = await prisma.registroHabito.upsert({
    where: { clienteId_data: { clienteId, data } },
    update: { aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao },
    create: { clienteId, data, aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao },
  });

  return NextResponse.json(habito);
}
