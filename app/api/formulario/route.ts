import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id || typeof id !== 'string' || id.length > 50) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const formulario = await prisma.formulario.findUnique({
    where: { id },
    select: { id: true, titulo: true, perguntas: true },
  });

  if (!formulario) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
  return NextResponse.json(formulario);
}

export async function POST(req: NextRequest) {
  try {
    const { formularioId, respostas } = await req.json();

    if (!formularioId || typeof formularioId !== 'string' || formularioId.length > 50) {
      return NextResponse.json({ error: 'formularioId inválido' }, { status: 400 });
    }

    if (!respostas || !Array.isArray(respostas) || respostas.length > 50) {
      return NextResponse.json({ error: 'Respostas inválidas' }, { status: 400 });
    }

    // Verifica que o formulário existe antes de criar resposta
    const formulario = await prisma.formulario.findUnique({
      where: { id: formularioId },
      select: { id: true },
    });

    if (!formulario) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });

    const resposta = await prisma.respostaFormulario.create({
      data: { formularioId, respostas },
    });

    return NextResponse.json(resposta, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
