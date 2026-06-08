import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET — buscar dieta ativa de um cliente (para edição)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const dieta = await prisma.dieta.findFirst({
    where: { clienteId, ativa: true },
    include: {
      refeicoes: {
        include: { alimentos: { include: { receita: true } } },
        orderBy: { tipo: 'asc' },
      },
    },
  });

  return NextResponse.json(dieta);
}

// POST — criar nova dieta (desativa anteriores)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { clienteId, titulo, refeicoes } = await req.json();

  await prisma.dieta.updateMany({
    where: { clienteId, ativa: true },
    data: { ativa: false },
  });

  const dieta = await prisma.dieta.create({
    data: {
      clienteId,
      titulo,
      refeicoes: {
        create: refeicoes.map((ref: { tipo: string; horarioSugerido?: string; alimentos: { nome: string; quantidade: string; observacao?: string; receitaId?: string }[] }) => ({
          tipo: ref.tipo,
          horarioSugerido: ref.horarioSugerido,
          alimentos: {
            create: ref.alimentos.map((al) => ({
              nome: al.nome,
              quantidade: al.quantidade,
              observacao: al.observacao,
              receitaId: al.receitaId,
            })),
          },
        })),
      },
    },
    include: { refeicoes: { include: { alimentos: true } } },
  });

  return NextResponse.json(dieta, { status: 201 });
}

// PUT — editar dieta existente (exclui refeições antigas e recria)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { dietaId, titulo, refeicoes } = await req.json();

  // Excluir refeições antigas (cascade exclui alimentos)
  await prisma.refeicao.deleteMany({ where: { dietaId } });

  // Atualizar título e recriar refeições
  const dieta = await prisma.dieta.update({
    where: { id: dietaId },
    data: {
      titulo,
      refeicoes: {
        create: refeicoes.map((ref: { tipo: string; horarioSugerido?: string; alimentos: { nome: string; quantidade: string; observacao?: string; receitaId?: string }[] }) => ({
          tipo: ref.tipo,
          horarioSugerido: ref.horarioSugerido,
          alimentos: {
            create: ref.alimentos.map((al) => ({
              nome: al.nome,
              quantidade: al.quantidade,
              observacao: al.observacao,
              receitaId: al.receitaId,
            })),
          },
        })),
      },
    },
    include: { refeicoes: { include: { alimentos: true } } },
  });

  return NextResponse.json(dieta);
}

// DELETE — excluir dieta
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { dietaId } = await req.json();
  await prisma.dieta.delete({ where: { id: dietaId } });

  return NextResponse.json({ ok: true });
}
