import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - formulários do paciente logado
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const formularios = await prisma.formulario.findMany({
    where: { clienteId: session.userId },
    include: { respostas: { select: { id: true } } },
    orderBy: { criadoEm: 'desc' },
  });

  // Retorna com flag de respondido
  const result = formularios.map(f => ({
    id: f.id,
    titulo: f.titulo,
    criadoEm: f.criadoEm,
    respondido: f.respostas.length > 0,
  }));

  return NextResponse.json(result);
}

// POST - paciente envia respostas
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { formularioId, respostas } = await req.json();
  if (!formularioId || !respostas) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  // Verificar se o formulário pertence ao paciente
  const formulario = await prisma.formulario.findFirst({
    where: { id: formularioId, clienteId: session.userId },
  });
  if (!formulario) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });

  const resposta = await prisma.respostaFormulario.create({
    data: { formularioId, respostas },
  });

  return NextResponse.json(resposta);
}
