import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { enviarEmail, emailConfirmacaoAgendamento, emailCancelamentoAgendamento, emailRemarcacaoAgendamento, emailAgendamentoRecebido } from '@/lib/email';

// GET — horários ocupados por data (público) OU lista completa (admin)
export async function GET(req: NextRequest) {
  try {
    const dataParam = req.nextUrl.searchParams.get('data');

    if (dataParam) {
      // Valida formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
        return NextResponse.json([], { status: 400 });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ocupados = await (prisma as any).agendamento.findMany({
        where: { data: dataParam, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
        select: { horario: true },
      });
      return NextResponse.json(ocupados.map((a: { horario: string }) => a.horario));
    }

    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json([], { status: 403 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agendamentos = await (prisma as any).agendamento.findMany({
      orderBy: [{ data: 'desc' }, { horario: 'asc' }],
    });
    return NextResponse.json(agendamentos);
  } catch (e) {
    console.error('[AGENDAMENTO GET]', e);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — criar agendamento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, data, horario, nome, email, telefone, mensagem, confirmarDireto } = body;

    // Validações
    if (!tipo || !data || !horario || !nome || !email) {
      return NextResponse.json({ error: 'Campos obrigatórios: tipo, data, horario, nome, email' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return NextResponse.json({ error: 'Formato de data inválido. Use YYYY-MM-DD' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(horario)) {
      return NextResponse.json({ error: 'Formato de horário inválido. Use HH:MM' }, { status: 400 });
    }

    // Verificar conflito
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existente = await (prisma as any).agendamento.findFirst({
      where: { data, horario, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
    });
    if (existente) {
      return NextResponse.json({ error: 'Este horário já está ocupado. Escolha outro.' }, { status: 409 });
    }

    const status = confirmarDireto ? 'CONFIRMADO' : 'PENDENTE';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agendamento = await (prisma as any).agendamento.create({
      data: { tipo, data, horario, nome, email, telefone: telefone || '', mensagem: mensagem || null, status },
    });

    // Enviar email
    if (email) {
      try {
        if (confirmarDireto) {
          const { subject, html } = emailConfirmacaoAgendamento(nome, data, horario, tipo);
          await enviarEmail({ to: email, subject, html });
        } else {
          const { subject, html } = emailAgendamentoRecebido(nome, data, horario, tipo);
          await enviarEmail({ to: email, subject, html });
        }
      } catch (emailErr) {
        console.error('[AGENDAMENTO EMAIL]', emailErr);
      }
    }

    return NextResponse.json(agendamento, { status: 201 });
  } catch (e) {
    console.error('[AGENDAMENTO POST]', e);
    return NextResponse.json({ error: 'Erro interno ao criar agendamento' }, { status: 500 });
  }
}

// PUT — confirmar, cancelar, remarcar, realizado
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { id, acao, novaData, novoHorario } = await req.json();
    if (!id || !acao) return NextResponse.json({ error: 'id e acao obrigatórios' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agendamento = await (prisma as any).agendamento.findUnique({ where: { id } });
    if (!agendamento) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });

    if (acao === 'confirmar') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).agendamento.update({ where: { id }, data: { status: 'CONFIRMADO' } });
      if (agendamento.email) {
        const { subject, html } = emailConfirmacaoAgendamento(agendamento.nome, agendamento.data, agendamento.horario, agendamento.tipo);
        await enviarEmail({ to: agendamento.email, subject, html }).catch(() => {});
      }
    } else if (acao === 'cancelar') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).agendamento.update({ where: { id }, data: { status: 'CANCELADO' } });
      if (agendamento.email) {
        const { subject, html } = emailCancelamentoAgendamento(agendamento.nome, agendamento.data, agendamento.horario);
        await enviarEmail({ to: agendamento.email, subject, html }).catch(() => {});
      }
    } else if (acao === 'remarcar') {
      if (!novaData || !novoHorario) return NextResponse.json({ error: 'novaData e novoHorario obrigatórios' }, { status: 400 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflito = await (prisma as any).agendamento.findFirst({
        where: { data: novaData, horario: novoHorario, status: { in: ['PENDENTE', 'CONFIRMADO'] }, id: { not: id } },
      });
      if (conflito) return NextResponse.json({ error: 'Novo horário já está ocupado' }, { status: 409 });

      const dataAnterior = `${agendamento.data} às ${agendamento.horario}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).agendamento.update({ where: { id }, data: { data: novaData, horario: novoHorario, status: 'CONFIRMADO' } });
      if (agendamento.email) {
        const { subject, html } = emailRemarcacaoAgendamento(agendamento.nome, dataAnterior, novaData, novoHorario);
        await enviarEmail({ to: agendamento.email, subject, html }).catch(() => {});
      }
    } else if (acao === 'realizado') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).agendamento.update({ where: { id }, data: { status: 'REALIZADO' } });
    } else {
      return NextResponse.json({ error: `Ação "${acao}" não reconhecida` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[AGENDAMENTO PUT]', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agendamento.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[AGENDAMENTO DELETE]', e);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
