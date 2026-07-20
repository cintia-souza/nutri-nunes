import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const clientes = await prisma.usuario.findMany({
    where: { role: 'CLIENTE' },
    select: { id: true, nome: true, email: true, pesoAtual: true, telefone: true },
    orderBy: { nome: 'asc' },
  });

  return NextResponse.json(clientes);
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir paciente' }, { status: 500 });
  }
}
