import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { analisarRelatorio, type DadosAnalise } from '@/lib/analise-relatorio';
import { RelatorioPDF } from '@/components/RelatorioPDFDoc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const clienteId = req.nextUrl.searchParams.get('clienteId');
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const [cliente, progressos, checks, avaliacoes, habitos, nutricionista] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: clienteId },
      select: { nome: true, email: true, pesoAtual: true, altura: true, objetivo: true, criadoEm: true },
    }),
    prisma.registroProgresso.findMany({ where: { clienteId }, orderBy: { data: 'asc' } }),
    prisma.checkRefeicao.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 90 }),
    prisma.avaliacaoNutricional.findMany({ where: { clienteId }, orderBy: { data: 'asc' } }),
    prisma.registroHabito.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 30 }),
    prisma.usuario.findUnique({ where: { id: session.userId }, select: { nome: true } }),
  ]);

  if (!cliente) return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });

  const totalChecks = checks.length;
  const realizados = checks.filter(c => c.realizada).length;
  const aderencia = totalChecks > 0 ? Math.round((realizados / totalChecks) * 100) : 0;

  const pesosOrdenados = progressos.filter(p => p.peso);
  const pesoAtual = pesosOrdenados[pesosOrdenados.length - 1]?.peso ?? cliente.pesoAtual;
  const pesoInicial = pesosOrdenados[0]?.peso;

  const scoreHabitos = habitos.length > 0
    ? +(habitos.slice(0, 14).reduce((s, h) =>
        s + (h.aderenciaDieta + h.variedadeAlimentar + h.aceitacaoNovos + h.hidratacao + h.comportamentoMesa) / 5, 0
      ) / Math.min(habitos.length, 14)).toFixed(1)
    : null;

  const inicial = avaliacoes.find(a => a.tipo === 'INICIAL') ?? null;
  const atual = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

  const diasAcompanhamento = cliente.criadoEm
    ? Math.floor((Date.now() - new Date(cliente.criadoEm).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const dadosAnalise: DadosAnalise = {
    nome: cliente.nome,
    objetivo: cliente.objetivo,
    pesoAtual,
    pesoInicial,
    altura: cliente.altura,
    aderencia,
    scoreHabitos,
    inicial,
    atual,
    totalAvaliacoes: avaliacoes.length,
    diasAcompanhamento,
  };

  const analise = analisarRelatorio(dadosAnalise);
  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const nomeNutricionista = nutricionista?.nome ?? 'Nutricionista';

  const buffer = await renderToBuffer(
    React.createElement(RelatorioPDF, { dados: dadosAnalise, analise, mes, nomeNutricionista })
  );

  const nomeArquivo = `relatorio-${cliente.nome.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
    },
  });
}
