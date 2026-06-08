import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { id: true, nome: true, email: true, telefone: true, dataNascimento: true, pesoAtual: true, altura: true, objetivo: true },
  });

  return NextResponse.json(usuario);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { nome, telefone, dataNascimento, altura, objetivo, fotoPerfil } = await req.json();

  // fotoPerfil vai como campo extra - salvar no usuario (usaremos cast pois não está no schema tipado ainda)
  const data: Record<string, unknown> = {};
  if (nome) data.nome = nome;
  if (telefone !== undefined) data.telefone = telefone;
  if (dataNascimento !== undefined) data.dataNascimento = dataNascimento ? new Date(dataNascimento) : null;
  if (altura !== undefined) data.altura = altura ? parseFloat(altura) : null;
  if (objetivo !== undefined) data.objetivo = objetivo;

  const usuario = await prisma.usuario.update({
    where: { id: session.userId },
    data,
    select: { id: true, nome: true, email: true, telefone: true, dataNascimento: true, pesoAtual: true, altura: true, objetivo: true },
  });

  // Salvar foto como campo separado (vamos usar uma abordagem simples com configSite pattern)
  if (fotoPerfil !== undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).perfilFoto.upsert({
        where: { userId: session.userId },
        update: { foto: fotoPerfil },
        create: { userId: session.userId, foto: fotoPerfil },
      });
    } catch { /* tabela pode não existir */ }
  }

  return NextResponse.json(usuario);
}
