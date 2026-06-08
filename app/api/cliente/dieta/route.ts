import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const dieta = await prisma.dieta.findFirst({
    where: { clienteId: session.userId, ativa: true },
    include: {
      refeicoes: {
        include: { alimentos: { include: { receita: true } } },
        orderBy: { tipo: 'asc' },
      },
    },
  });

  return NextResponse.json(dieta);
}
