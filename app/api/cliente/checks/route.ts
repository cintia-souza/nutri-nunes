import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const data = req.nextUrl.searchParams.get('data') || new Date().toISOString().split('T')[0];

  const checks = await prisma.checkRefeicao.findMany({
    where: { clienteId: session.userId, data },
  });

  return NextResponse.json(checks);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { refeicaoId, realizada, data } = await req.json();

  const check = await prisma.checkRefeicao.upsert({
    where: { clienteId_refeicaoId_data: { clienteId: session.userId, refeicaoId, data } },
    update: { realizada },
    create: { clienteId: session.userId, refeicaoId, data, realizada },
  });

  return NextResponse.json(check);
}
