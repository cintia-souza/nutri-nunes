import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// ─────────────────────────────────────────────
// PADRÃO DE ISOLAMENTO MULTI-TENANT
//
// Toda rota admin segue este fluxo:
//   1. Verifica autenticação + role ADMIN
//   2. Extrai tenantId do JWT (nunca do body/query — evita IDOR)
//   3. Aplica { tenantId } em TODOS os filtros Prisma
//
// O tenantId no JWT é definido no login e não pode ser
// manipulado pelo cliente sem invalidar a assinatura HS256.
// ─────────────────────────────────────────────

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  // tenantId vem do JWT — imutável pelo cliente
  const { tenantId } = session;

  const clientes = await prisma.usuario.findMany({
    where: {
      tenantId,        // isolamento: só pacientes deste nutricionista
      role: 'CLIENTE',
    },
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

    const { tenantId } = session;
    const { id } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    // Verifica ownership antes de deletar — previne IDOR cross-tenant
    const cliente = await prisma.usuario.findFirst({
      where: { id, tenantId, role: 'CLIENTE' },
      select: { id: true },
    });

    if (!cliente) {
      // Retorna 404 (não 403) para não vazar existência de IDs de outros tenants
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir paciente' }, { status: 500 });
  }
}
