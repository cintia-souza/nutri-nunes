import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const avaliacoes = await prisma.avaliacaoNutricional.findMany({
    where: { clienteId },
    orderBy: { data: 'asc' },
  });

  return NextResponse.json(avaliacoes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const body = await req.json();
  const { clienteId, data, tipo, frutas, verduras, legumes, proteinas, cereais, agua, refrigerantes, doces, fastFood, ultraprocessados, beliscos, observacao } = body;

  if (!clienteId || !data || !tipo) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });

  const avaliacao = await prisma.avaliacaoNutricional.create({
    data: { clienteId, data, tipo, frutas, verduras, legumes, proteinas, cereais, agua, refrigerantes, doces, fastFood, ultraprocessados, beliscos, observacao },
  });

  return NextResponse.json(avaliacao);
}
