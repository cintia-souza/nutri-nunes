import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { tipo, data, horario, nome, email, telefone, mensagem } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agendamento = await (prisma as any).agendamento.create({
    data: { tipo, data, horario, nome, email, telefone, mensagem },
  });

  return NextResponse.json(agendamento, { status: 201 });
}

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agendamentos = await (prisma as any).agendamento.findMany({
    orderBy: { criadoEm: 'desc' },
  });
  return NextResponse.json(agendamentos);
}
