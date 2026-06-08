import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });

  const clientes = await prisma.usuario.findMany({
    where: { role: 'CLIENTE' },
    select: { id: true, nome: true, email: true, pesoAtual: true, telefone: true },
  });

  return NextResponse.json(clientes);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id } = await req.json();
  await prisma.usuario.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
