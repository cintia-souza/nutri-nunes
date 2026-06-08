import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { enviarEmail, emailConfirmacaoAgendamento, emailCancelamentoAgendamento, emailRemarcacaoAgendamento } from '@/lib/email';

// GET — listar agendamentos (admin: todos, público: horários ocupados por data)
export async function GET(req: NextRequest) {
  const dataParam = req.nextUrl.searchParams.get('data');

  // Se pede horários de uma data específica (público) — retorna apenas horários ocupados
  if (dataParam) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ocupados = await (prisma as any).agendamento.findMany({
      where: { data: dataParam, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
      select: { horario: true },
    });
    return NextResponse.json(ocupados.map((a: { horario: string }) => a.horario));
  }

  // Admin: lista todos
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agendamentos = await (prisma as any).agendamento.findMany({
    orderBy: [{ data: 'asc' }, { horario: 'asc' }],
  });
  return NextResponse.json(agendamentos);
}

// POST — criar agendamento (público ou admin manual)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, data, horario, nome, email, telefone, mensagem, confirmarDireto } = body;

  // Verificar se horário está disponível
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existente = await (prisma as any).agendamento.findFirst({
    where: { data, horario, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
  });

  if (existente) {
    return NextResponse.json({ error: 'Horário indisponível' }, { status: 409 });
  }

  const status = confirmarDireto ? 'CONFIRMADO' : 'PENDENTE';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agendamento = await (prisma as any).agendamento.create({
    data: { tipo, data, horario, nome, email, telefone, mensagem, status },
  });

  // Se confirmado direto (admin criou), enviar email de confirmação
  if (confirmarDireto && email) {
    const { subject, html } = emailConfirmacaoAgendamento(nome, data, horario, tipo);
    await enviarEmail({ to: email, subject, html });
  }

  return NextResponse.json(agendamento, { status: 201 });
}

// PUT — confirmar, cancelar ou remarcar
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id, acao, novaData, novoHorario } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agendamento = await (prisma as any).agendamento.findUnique({ where: { id } });
  if (!agendamento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  if (acao === 'confirmar') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agendamento.update({ where: { id }, data: { status: 'CONFIRMADO' } });

    // Enviar email de confirmação
    if (agendamento.email) {
      const { subject, html } = emailConfirmacaoAgendamento(agendamento.nome, agendamento.data, agendamento.horario, agendamento.tipo);
      await enviarEmail({ to: agendamento.email, subject, html });
    }
  }

  if (acao === 'cancelar') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agendamento.update({ where: { id }, data: { status: 'CANCELADO' } });

    if (agendamento.email) {
      const { subject, html } = emailCancelamentoAgendamento(agendamento.nome, agendamento.data, agendamento.horario);
      await enviarEmail({ to: agendamento.email, subject, html });
    }
  }

  if (acao === 'remarcar' && novaData && novoHorario) {
    // Verificar disponibilidade do novo horário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conflito = await (prisma as any).agendamento.findFirst({
      where: { data: novaData, horario: novoHorario, status: { in: ['PENDENTE', 'CONFIRMADO'] }, id: { not: id } },
    });
    if (conflito) return NextResponse.json({ error: 'Novo horário indisponível' }, { status: 409 });

    const dataAnterior = `${agendamento.data} às ${agendamento.horario}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agendamento.update({ where: { id }, data: { data: novaData, horario: novoHorario, status: 'CONFIRMADO' } });

    if (agendamento.email) {
      const { subject, html } = emailRemarcacaoAgendamento(agendamento.nome, dataAnterior, novaData, novoHorario);
      await enviarEmail({ to: agendamento.email, subject, html });
    }
  }

  if (acao === 'realizado') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agendamento.update({ where: { id }, data: { status: 'REALIZADO' } });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — excluir agendamento
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).agendamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
