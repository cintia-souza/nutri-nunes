import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const hoje = new Date();
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 7);

  const ultimoPeso = await prisma.registroProgresso.findFirst({
    where: { clienteId: session.userId, peso: { not: null } },
    orderBy: { data: 'desc' },
  });

  const precisaAtualizarPeso = !ultimoPeso || ultimoPeso.data < seteDiasAtras.toISOString().split('T')[0];

  const hojeStr = hoje.toISOString().split('T')[0];
  const registroHoje = await prisma.registroProgresso.findUnique({
    where: { clienteId_data: { clienteId: session.userId, data: hojeStr } },
  });

  return NextResponse.json({
    precisaAtualizarPeso,
    aguaHoje: registroHoje?.aguaMl || 0,
    ultimoPeso: ultimoPeso?.peso || null,
    dataUltimoPeso: ultimoPeso?.data || null,
  });
}
