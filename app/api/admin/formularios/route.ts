import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const formularios = await prisma.formulario.findMany({
    where: { clienteId },
    include: { respostas: { orderBy: { respondidoEm: 'desc' }, take: 1 } },
    orderBy: { criadoEm: 'desc' },
  });

  return NextResponse.json(formularios);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { clienteId, titulo, perguntas } = await req.json();
  if (!clienteId || !titulo || !perguntas?.length) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const formulario = await prisma.formulario.create({
    data: { clienteId, titulo, perguntas },
  });

  return NextResponse.json(formulario);
}
