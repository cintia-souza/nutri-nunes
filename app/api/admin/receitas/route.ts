import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET — listar todas as receitas
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });

  const receitas = await prisma.receita.findMany({
    orderBy: { titulo: 'asc' },
    include: { _count: { select: { alimentos: true } } },
  });

  return NextResponse.json(receitas);
}

// POST — criar receita
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { titulo, ingredientes, modoPreparo, tempoPreparo, videoUrl } = await req.json();

  const receita = await (prisma.receita.create as Function)({
    data: { titulo, ingredientes, modoPreparo, tempoPreparo, videoUrl },
  });

  return NextResponse.json(receita, { status: 201 });
}

// PUT — editar receita
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id, titulo, ingredientes, modoPreparo, tempoPreparo, videoUrl } = await req.json();

  const receita = await (prisma.receita.update as Function)({
    where: { id },
    data: { titulo, ingredientes, modoPreparo, tempoPreparo, videoUrl },
  });

  return NextResponse.json(receita);
}

// DELETE — excluir receita
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id } = await req.json();
  await prisma.receita.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
