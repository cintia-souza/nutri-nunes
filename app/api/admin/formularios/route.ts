import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  const { tenantId } = session;

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const formularios = await prisma.formulario.findMany({
    where: { tenantId, clienteId },
    include: { respostas: { orderBy: { respondidoEm: 'desc' }, take: 1 } },
    orderBy: { criadoEm: 'desc' },
  });
  return NextResponse.json(formularios);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  const { tenantId } = session;

  const { clienteId, titulo, perguntas } = await req.json();
  if (!clienteId || !titulo || !perguntas?.length) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  // Verifica que o cliente pertence ao tenant
  const cliente = await prisma.usuario.findFirst({ where: { id: clienteId, tenantId }, select: { id: true } });
  if (!cliente) return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });

  const formulario = await prisma.formulario.create({
    data: { tenantId, clienteId, titulo, perguntas },
  });
  return NextResponse.json(formulario);
}
