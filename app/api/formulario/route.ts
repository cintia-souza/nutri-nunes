import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - buscar formulário por id (público para paciente)
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const formulario = await prisma.formulario.findUnique({
    where: { id },
    select: { id: true, titulo: true, perguntas: true },
  });

  if (!formulario) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
  return NextResponse.json(formulario);
}

// POST - paciente envia respostas
export async function POST(req: NextRequest) {
  const { formularioId, respostas } = await req.json();
  if (!formularioId || !respostas) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const resposta = await prisma.respostaFormulario.create({
    data: { formularioId, respostas },
  });

  return NextResponse.json(resposta);
}
