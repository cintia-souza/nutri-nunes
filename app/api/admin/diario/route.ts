import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const entradas = await prisma.entradaDiario.findMany({
    where: { clienteId },
    orderBy: { data: 'desc' },
  });

  return NextResponse.json(entradas);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const body = await req.json();
  const { clienteId, data, tipo, titulo, texto, peso, pressaoSist, pressaoDiast, glicemia, temperatura, circAbdominal, circBraco, circQuadril, avaliacaoNutricionalId } = body;

  if (!clienteId || !data || !tipo) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });

  const entrada = await prisma.entradaDiario.create({
    data: { clienteId, data, tipo, titulo, texto, peso, pressaoSist, pressaoDiast, glicemia, temperatura, circAbdominal, circBraco, circQuadril, avaliacaoNutricionalId },
  });

  return NextResponse.json(entrada);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { id } = await req.json();
  await prisma.entradaDiario.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
