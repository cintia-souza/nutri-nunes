import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - histórico de hábitos + avaliações nutricionais do paciente logado
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const [habitos, avaliacoes] = await Promise.all([
    prisma.registroHabito.findMany({
      where: { clienteId: session.userId },
      orderBy: { data: 'desc' },
      take: 30,
    }),
    prisma.avaliacaoNutricional.findMany({
      where: { clienteId: session.userId },
      orderBy: { data: 'asc' },
    }),
  ]);

  return NextResponse.json({ habitos, avaliacoes });
}

// POST - paciente registra hábitos do dia
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, acFrutas, acVerduras, acLegumes, acProteinas, acCereais, acAgua, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao } = await req.json();
  if (!data) return NextResponse.json({ error: 'Data obrigatória' }, { status: 400 });

  const habito = await prisma.registroHabito.upsert({
    where: { clienteId_data: { clienteId: session.userId, data } },
    update: { aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, acFrutas, acVerduras, acLegumes, acProteinas, acCereais, acAgua, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao },
    create: { clienteId: session.userId, data, aderenciaDieta, variedadeAlimentar, aceitacaoNovos, hidratacao, comportamentoMesa, acFrutas, acVerduras, acLegumes, acProteinas, acCereais, acAgua, refrigerante, doces, fastFood, ultraprocessados, beliscos, observacao },
  });

  return NextResponse.json(habito);
}
